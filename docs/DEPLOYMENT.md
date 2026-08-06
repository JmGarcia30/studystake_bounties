# Deployment Guide — Level 3 (Orange Belt)

This document covers deploying **both** contracts (`studystake_bounties` and
`studystake_reputation`) to Stellar Testnet, wiring them together, and
generating TypeScript bindings, using `scripts/deploy.sh`.

This is the Level 3 deployment workflow. It is deliberately separate from
the manual Level 2 steps documented in the root `README.md` — see
[Why Level 2 and Level 3 addresses stay separate](#why-level-2-and-level-3-addresses-stay-separate)
below.

## Prerequisites

| Tool | Version used to write/verify this guide | Check |
|---|---|---|
| Stellar CLI | 27.0.0 | `stellar --version` |
| Rust / Cargo | 1.88.0 (pinned via `rust-toolchain.toml`) | `cargo --version` |
| wasm32v1-none target | — | `rustup target list --installed` (or equivalent) |

Node/npm are **not** required to run `scripts/deploy.sh` itself — bindings
generation is a pure Stellar CLI operation against the built `.wasm` files.
Node/npm are only needed afterward, if you choose to run
`npm install && npm run build` inside a generated bindings package (see
[Bindings generation](#bindings-generation)).

The exact command syntax in this guide and in `scripts/deploy.sh` was
verified against a real, installed Stellar CLI 27.0.0 (`stellar --help` and
each relevant subcommand's `--help`) — not assumed from older CLI versions
or older examples.

## Required Stellar identity setup

The script never accepts or prints a secret key or seed phrase. It only
ever works with a named CLI identity that `stellar` itself resolves:

```bash
stellar keys generate deployer --fund --network testnet
stellar keys public-key deployer   # prints the address, sanity-check it
```

`--fund` calls Testnet Friendbot once, for that identity. If you already
have a funded Testnet identity, skip `keys generate` and just reference its
name.

## Required environment variables

Copy the example file and fill it in:

```bash
cp .env.deploy.example .env.deploy
```

`.env.deploy` is gitignored — it is never committed. `.env.deploy.example`
has no real values and is safe to commit.

| Variable | Required | Default | Meaning |
|---|---|---|---|
| `DEPLOY_NETWORK` | no | `testnet` | Target network. Anything else requires `DEPLOY_ALLOW_NON_TESTNET=1`. |
| `DEPLOY_SOURCE_IDENTITY` | **yes** | — | Name of a Stellar CLI identity (see above). Signs every transaction; becomes both contracts' admin unless overridden. |
| `DEPLOY_ADMIN_ADDRESS` | no | deployer's own address | Admin address for both contracts, if different from the deployer. |
| `DEPLOY_RPC_URL` | no | CLI's built-in testnet default | Override only if you need a non-default RPC endpoint. |
| `DEPLOY_ALLOW_NON_TESTNET` | no | `0` | Must be `1` to target anything other than `testnet`. |
| `DEPLOY_TOKEN_ID` | no | testnet native-XLM SAC | Not used in any on-chain call — passed through into the deployment summary only, for convenience when filling in `frontend/.env` afterward. |
| `DEPLOY_REPUTATION_CONTRACT_ID` | no | — | Set to reuse an already-deployed reputation contract instead of deploying a new one. |
| `DEPLOY_BOUNTY_CONTRACT_ID` | no | — | Set to reuse an already-deployed bounty contract instead of deploying a new one. |
| `BINDINGS_BOUNTIES_DIR` | no | `frontend/src/lib/bindings/studystake_bounties` | Where bounty contract TS bindings are written. |
| `BINDINGS_REPUTATION_DIR` | no | `frontend/src/lib/bindings/studystake_reputation` | Where reputation contract TS bindings are written. |
| `DEPLOYMENT_OUTPUT_DIR` | no | `.deployments` | Where the deployment summary is written. |

## Dry-run / validation process

Before ever touching the network, run:

```bash
./scripts/deploy.sh --dry-run
```

This performs every safety check (CLI present and version-matched, network
confirmed as testnet, identity exists, both contracts build) and **prints
every command it would run**, without executing any `stellar contract
deploy` / `stellar contract invoke` call. Nothing is written to
`.deployments/` in dry-run mode.

You can also just syntax-check the script itself:

```bash
bash -n scripts/deploy.sh
```

## Exact command to run

```bash
./scripts/deploy.sh
```

Run it from anywhere inside the repo — the script locates the repo root
itself. It reads `.env.deploy` from the repo root by default (override with
`DEPLOY_ENV_FILE=/path/to/file`).

## Deployment order

The script enforces this exact order and stops on the first failure:

1. Build both contracts (`cargo build --target wasm32v1-none --release`)
2. Deploy `studystake_reputation`
3. Deploy `studystake_bounties`
4. Initialize `studystake_reputation` (`initialize --admin <ADMIN>`)
5. Initialize `studystake_bounties` (`initialize --admin <ADMIN>`)
6. Reputation contract authorizes the bounty contract
   (`set_authorized --admin <ADMIN> --bounty_contract <BOUNTY_ID>`)
7. Bounty contract stores the reputation contract's address
   (`set_reputation --admin <ADMIN> --reputation_contract <REPUTATION_ID>`)
8. Verify the wiring with a read-only call
9. Generate TypeScript bindings for both contracts

Reputation is deployed and wired to authorize the bounty contract **before**
the bounty contract is told to use it (step 6 before step 7), so there is
never a window where the bounty contract points at a reputation contract
that isn't yet ready to accept calls from it.

## Contract initialization

Both contracts use a plain `initialize(admin)` function (not a WASM
constructor), matching how the Level 2 contract was initialized. This is
**intentionally one-time** — a second `initialize` call on an
already-initialized contract returns `Error::AlreadyInitialized` (bounty
contract discriminant `1`; reputation contract discriminant `1` in its own,
separate error enum). The script does not catch, retry, or hide this error.
If you see it, you're re-running against a contract that's already set up —
see [How to redeploy safely](#how-to-redeploy-safely).

## Cross-contract wiring

- `stellar contract invoke --id <REPUTATION_ID> --source-account <identity> --network testnet -- set_authorized --admin <ADMIN> --bounty_contract <BOUNTY_ID>`
- `stellar contract invoke --id <BOUNTY_ID> --source-account <identity> --network testnet -- set_reputation --admin <ADMIN> --reputation_contract <REPUTATION_ID>`

Both calls require the given `--admin` to `require_auth()` and match the
contract's stored admin (set during `initialize`) — the deploying identity
must be that admin, or these calls fail with `NotAdmin`.

## Bindings generation

```bash
stellar contract bindings typescript --wasm <path-to-wasm> --output-dir <dir> --overwrite
```

This is generated from the **built `.wasm` file**, not from a live deployed
contract instance — it works entirely offline once the contract is built,
which is why `scripts/deploy.sh --dry-run` can validate the exact command
even though it doesn't execute it.

**What actually gets generated** (verified by running this for real against
both contracts' `.wasm` files): a small, complete npm package per contract —
`package.json`, `tsconfig.json`, `README.md`, `src/index.ts`, and its own
`.gitignore` — not a handful of loose source files. This matches the
Stellar CLI's own documented behavior ("Where to place generated project").
Each package's `.gitignore` covers `node_modules/` and `out/`; this repo
additionally excludes `dist/` (the actual `tsc` build output per its
`package.json`), since the CLI's own generated `.gitignore` doesn't cover it.

Output locations:
- `frontend/src/lib/bindings/studystake_bounties/`
- `frontend/src/lib/bindings/studystake_reputation/`

**These are committed as generated source** (not gitignored wholesale) —
they're deterministically reproducible from the contract source, not
machine- or deployment-specific, unlike `.deployments/`.

**Not wired into the frontend yet** — this phase only generates/prepares
them, per its scope. Two things to resolve before wiring them in:
- Each generated package pins its own `@stellar/stellar-sdk` (`^14.5.0` at
  time of writing), independent of and older than the frontend's own
  `@stellar/stellar-sdk` (`^16.2.0`). Reconcile this before importing them
  directly into the frontend build.
- To actually build the generated package (`npm install && npm run build`
  inside its directory), Node/npm is required — the deploy script itself
  never needs this, since it never builds the generated TS, only generates
  it.

## Verification commands

The script verifies the wiring with:

```bash
stellar contract invoke --id <BOUNTY_ID> --source-account <identity> --network testnet --send=no -- get_reputation_contract
```

`--send=no` forces simulation-only (no transaction submitted, no fee) since
this is a pure read. The script fails loudly if the returned address
doesn't match what was just configured.

**Known gap**: `studystake_reputation` currently has no read-only getter for
the authorized-contract address it accepts via `set_authorized` — only the
write path exists (`set_authorized`), not a matching read (something like
`get_authorized_contract`). That direction of the wiring is therefore
confirmed only by `set_authorized` completing without error at deploy time;
it isn't independently re-verified afterward the way the bounty→reputation
link is. It gets exercised for real the first time `release_funds` or a
tutor-favored `resolve_dispute` actually runs on Testnet (see Phase 6's
integration tests, which prove this exact call path against real registered
contract instances in the test `Env`). Adding a getter is a reasonable
small follow-up for a later phase; it's out of scope here since this phase
does not change contract behavior.

## Expected output

On success, the script prints and saves (to `.deployments/testnet-latest.env`
and `.deployments/testnet-latest.json`) a summary containing: network,
deployer address, admin address, the token id passed through for reference,
both contract addresses, every transaction hash it could extract from CLI
logs (best-effort — see below), and both bindings output paths. No secret
ever appears in this output.

Transaction hashes are extracted by scanning each command's captured stderr
for a 64-character hex string (the CLI logs the submitted transaction hash
to stderr at default verbosity). This is best-effort: if the CLI's log
format doesn't match, the summary shows `unavailable` for that hash rather
than a wrong value — the deployment itself is not affected either way, since
nothing downstream depends on successfully parsing a hash.

## Common failure cases

| Symptom | Cause | Fix |
|---|---|---|
| `stellar CLI not found on PATH` | CLI not installed | Install Stellar CLI 27.x |
| `Stellar CLI X found, but this script was written against ... 27.0.0` | Wrong CLI major version | Install a matching CLI, or review the script's commands against your version's `--help` first |
| `.env.deploy not found` | Setup step skipped | `cp .env.deploy.example .env.deploy` and fill it in |
| `Stellar identity '<name>' was not found` | Identity never created, or wrong name | `stellar keys generate <name> --fund --network testnet` |
| `DEPLOY_NETWORK=mainnet, but this script defaults to testnet-only` | Safety rail | Set `DEPLOY_ALLOW_NON_TESTNET=1` only if this is genuinely intentional |
| `AlreadyInitialized` from `initialize` | Re-running against an already-initialized contract | See below |
| `NotAdmin` from `set_authorized`/`set_reputation` | `DEPLOY_ADMIN_ADDRESS` (or the deployer identity) doesn't match the contract's stored admin | Use the same identity/admin that ran `initialize` |
| verification step fails after wiring | `set_reputation` didn't take, or wrong contract id used | Re-run `get_reputation_contract` manually against the bounty contract id to inspect current state |

## How to redeploy safely

Because `initialize` is genuinely one-time by design (this is a security
property, not a limitation to work around), "redeploying" means one of two
things:

- **A fresh pair of contracts** (e.g. after a contract code change): just
  re-run `./scripts/deploy.sh` with `DEPLOY_REPUTATION_CONTRACT_ID` and
  `DEPLOY_BOUNTY_CONTRACT_ID` unset. New addresses, new initialization, new
  wiring, new bindings — nothing about the old pair is touched.
- **Re-wiring an existing pair** (e.g. wiring failed partway through): set
  `DEPLOY_REPUTATION_CONTRACT_ID` and/or `DEPLOY_BOUNTY_CONTRACT_ID` in
  `.env.deploy` to the already-deployed addresses. The script skips the
  `deploy` step for whichever id was supplied and proceeds straight to
  initialize/wire/verify/bindings — and if `initialize` was already done,
  it will correctly stop on `AlreadyInitialized` rather than silently
  continuing, so you'll know exactly which step to resume from.

There is no single command that is safely re-runnable end-to-end against
the same already-initialized contracts — that's deliberate. A script that
silently no-ops past `AlreadyInitialized` could mask a genuine
misconfiguration (e.g. wiring the wrong two contracts together).

## Why Level 2 and Level 3 addresses stay separate

The Level 2 (Yellow Belt) contract, deployed at
`CCEBMZKEH4GBRZVYDDGMSXWCHTL57ZIG6YRVZWRHTU4BP6QZVWQPXI7I` (see root
`README.md`), predates the Level 3 changes: typed errors (Phase 2),
persistent storage with TTL (Phase 3), the dispute flow (Phase 4), and the
reputation contract and its wiring (Phases 5–6). Those changes alter the
bounty contract's WASM interface and storage layout, so they cannot be
"upgraded into" the existing Level 2 instance — a new deployment is
required. The Level 2 address and its proof stay documented and untouched
as their own evidence of that earlier milestone; the Level 3 deployment
produces a new, separate pair of addresses (bounty + reputation) recorded
in `.deployments/` and, once approved, in the README's Level 3 proof
section.
