#!/usr/bin/env bash
#
# Deploys studystake_reputation and studystake_bounties to Stellar Testnet,
# initializes both, wires them together, verifies the wiring, and generates
# TypeScript bindings for both contracts.
#
# Usage:
#   cp .env.deploy.example .env.deploy   # once, then edit it
#   ./scripts/deploy.sh --dry-run        # print every command, run nothing
#   ./scripts/deploy.sh                  # the real thing
#
# See docs/DEPLOYMENT.md for full documentation.

set -euo pipefail

# ---------------------------------------------------------------------------
# 0. Locate the repo root so this script works from any invocation directory.
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# ---------------------------------------------------------------------------
# 1. Load configuration.
# ---------------------------------------------------------------------------
ENV_FILE="${DEPLOY_ENV_FILE:-$REPO_ROOT/.env.deploy}"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  set -a
  source "$ENV_FILE"
  set +a
else
  echo "error: $ENV_FILE not found." >&2
  echo "       Copy .env.deploy.example to .env.deploy and fill it in first." >&2
  exit 1
fi

DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help)
      echo "Usage: $0 [--dry-run]"
      echo "  --dry-run   Print every command that would run; execute nothing."
      exit 0
      ;;
    *)
      echo "error: unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done
if [[ "${DEPLOY_DRY_RUN:-0}" == "1" ]]; then
  DRY_RUN=1
fi

DEPLOY_NETWORK="${DEPLOY_NETWORK:-testnet}"
DEPLOY_SOURCE_IDENTITY="${DEPLOY_SOURCE_IDENTITY:-}"
DEPLOY_ADMIN_ADDRESS="${DEPLOY_ADMIN_ADDRESS:-}"
DEPLOY_RPC_URL="${DEPLOY_RPC_URL:-}"
DEPLOY_TOKEN_ID="${DEPLOY_TOKEN_ID:-}"
DEPLOY_ALLOW_NON_TESTNET="${DEPLOY_ALLOW_NON_TESTNET:-0}"
BINDINGS_BOUNTIES_DIR="${BINDINGS_BOUNTIES_DIR:-frontend/src/lib/bindings/studystake_bounties}"
BINDINGS_REPUTATION_DIR="${BINDINGS_REPUTATION_DIR:-frontend/src/lib/bindings/studystake_reputation}"
DEPLOYMENT_OUTPUT_DIR="${DEPLOYMENT_OUTPUT_DIR:-.deployments}"

# Allow reusing already-deployed contracts instead of redeploying (see
# docs/DEPLOYMENT.md "How to redeploy safely"). Leave unset for a fresh
# deploy of both contracts.
EXISTING_REPUTATION_ID="${DEPLOY_REPUTATION_CONTRACT_ID:-}"
EXISTING_BOUNTY_ID="${DEPLOY_BOUNTY_CONTRACT_ID:-}"

EXPECTED_STELLAR_CLI_MAJOR="27"

log() { echo "==> $*"; }
fail() { echo "error: $*" >&2; exit 1; }

# ---------------------------------------------------------------------------
# 2. Verify required commands exist.
# ---------------------------------------------------------------------------
command -v stellar >/dev/null 2>&1 || fail "stellar CLI not found on PATH. Install Stellar CLI ${EXPECTED_STELLAR_CLI_MAJOR}.x first."
command -v cargo >/dev/null 2>&1 || fail "cargo not found on PATH."

# node/npm are only needed if you later run 'npm install && npm run build'
# inside a generated bindings package — this script itself never needs them.
if command -v node >/dev/null 2>&1; then
  NODE_AVAILABLE=1
else
  NODE_AVAILABLE=0
fi

# ---------------------------------------------------------------------------
# 3. Verify the Stellar CLI version is compatible.
# ---------------------------------------------------------------------------
STELLAR_VERSION_LINE="$(stellar --version | head -n1)"
STELLAR_VERSION="$(echo "$STELLAR_VERSION_LINE" | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -n1 || true)"
STELLAR_MAJOR="${STELLAR_VERSION%%.*}"
if [[ -z "$STELLAR_VERSION" ]]; then
  fail "could not parse a version number from: $STELLAR_VERSION_LINE"
fi
if [[ "$STELLAR_MAJOR" != "$EXPECTED_STELLAR_CLI_MAJOR" ]]; then
  fail "Stellar CLI $STELLAR_VERSION found, but this script was written against and verified with CLI ${EXPECTED_STELLAR_CLI_MAJOR}.0.0. Install a matching CLI 27.x or review this script's commands against \`stellar --help\` for your version before proceeding."
fi
log "Stellar CLI $STELLAR_VERSION OK"

# ---------------------------------------------------------------------------
# 4. Verify the selected network.
# ---------------------------------------------------------------------------
if [[ "$DEPLOY_NETWORK" != "testnet" && "$DEPLOY_ALLOW_NON_TESTNET" != "1" ]]; then
  fail "DEPLOY_NETWORK=$DEPLOY_NETWORK, but this script defaults to testnet-only. Set DEPLOY_ALLOW_NON_TESTNET=1 in .env.deploy if you genuinely intend to target a different network."
fi
log "Target network: $DEPLOY_NETWORK"

# ---------------------------------------------------------------------------
# 5. Require a configured deployer identity. Never accept or print a secret
#    key directly — only a named CLI identity that stellar itself resolves.
# ---------------------------------------------------------------------------
[[ -n "$DEPLOY_SOURCE_IDENTITY" ]] || fail "DEPLOY_SOURCE_IDENTITY is not set in $ENV_FILE. Run 'stellar keys generate <name> --fund --network testnet' first, then set DEPLOY_SOURCE_IDENTITY=<name>."

if ! stellar keys public-key "$DEPLOY_SOURCE_IDENTITY" >/dev/null 2>&1; then
  fail "Stellar identity '$DEPLOY_SOURCE_IDENTITY' was not found. Run: stellar keys generate $DEPLOY_SOURCE_IDENTITY --fund --network testnet"
fi
DEPLOYER_ADDRESS="$(stellar keys public-key "$DEPLOY_SOURCE_IDENTITY")"
ADMIN_ADDRESS="${DEPLOY_ADMIN_ADDRESS:-$DEPLOYER_ADDRESS}"
log "Deployer identity: $DEPLOY_SOURCE_IDENTITY ($DEPLOYER_ADDRESS)"
log "Admin address:     $ADMIN_ADDRESS"

# Common flags shared by every stellar CLI invocation below.
NET_FLAGS=(--network "$DEPLOY_NETWORK")
if [[ -n "$DEPLOY_RPC_URL" ]]; then
  NET_FLAGS+=(--rpc-url "$DEPLOY_RPC_URL")
fi
SRC_FLAGS=(--source-account "$DEPLOY_SOURCE_IDENTITY")

run() {
  # Prints the command always; executes it unless DRY_RUN=1.
  echo "    \$ $*"
  if [[ "$DRY_RUN" != "1" ]]; then
    "$@"
  fi
}

capture() {
  # Like run(), but in dry-run mode returns a placeholder instead of
  # executing, so downstream steps can still be printed for review. The
  # command preview always goes to stderr so `$(capture ...)` only ever
  # captures the actual result (or the placeholder) on stdout.
  echo "    \$ $*" >&2
  if [[ "$DRY_RUN" == "1" ]]; then
    echo "<dry-run: not executed>"
    return 0
  fi
  "$@"
}

if [[ "$DRY_RUN" == "1" ]]; then
  log "DRY RUN — no network calls will be made. Commands are printed, not executed."
fi

# ---------------------------------------------------------------------------
# 6. Build both contracts.
# ---------------------------------------------------------------------------
log "Building contracts (cargo build --target wasm32v1-none --release)"
run cargo build --target wasm32v1-none --release

# ---------------------------------------------------------------------------
# 7. Locate both WASM files.
# ---------------------------------------------------------------------------
REPUTATION_WASM="$REPO_ROOT/target/wasm32v1-none/release/studystake_reputation.wasm"
BOUNTY_WASM="$REPO_ROOT/target/wasm32v1-none/release/studystake_bounties.wasm"
if [[ "$DRY_RUN" != "1" ]]; then
  [[ -f "$REPUTATION_WASM" ]] || fail "expected wasm not found: $REPUTATION_WASM"
  [[ -f "$BOUNTY_WASM" ]] || fail "expected wasm not found: $BOUNTY_WASM"
fi
log "Reputation wasm: $REPUTATION_WASM"
log "Bounty wasm:     $BOUNTY_WASM"

mkdir -p "$DEPLOYMENT_OUTPUT_DIR"
DEPLOY_LOG_DIR="$(mktemp -d)"
trap 'rm -rf "$DEPLOY_LOG_DIR"' EXIT

# ---------------------------------------------------------------------------
# 8. Deploy studystake_reputation (unless an existing id was supplied).
# ---------------------------------------------------------------------------
if [[ -n "$EXISTING_REPUTATION_ID" ]]; then
  REPUTATION_ID="$EXISTING_REPUTATION_ID"
  log "Reusing existing reputation contract: $REPUTATION_ID (skipping deploy)"
else
  log "Deploying studystake_reputation"
  REPUTATION_ID="$(capture stellar contract deploy \
    --wasm "$REPUTATION_WASM" \
    "${SRC_FLAGS[@]}" "${NET_FLAGS[@]}" \
    2>"$DEPLOY_LOG_DIR/reputation-deploy.stderr" | tail -n1)"
  [[ "$DRY_RUN" == "1" ]] && REPUTATION_ID="<reputation-contract-id>"
  log "Reputation contract: $REPUTATION_ID"
fi

# ---------------------------------------------------------------------------
# 9. Deploy studystake_bounties (unless an existing id was supplied).
# ---------------------------------------------------------------------------
if [[ -n "$EXISTING_BOUNTY_ID" ]]; then
  BOUNTY_ID="$EXISTING_BOUNTY_ID"
  log "Reusing existing bounty contract: $BOUNTY_ID (skipping deploy)"
else
  log "Deploying studystake_bounties"
  BOUNTY_ID="$(capture stellar contract deploy \
    --wasm "$BOUNTY_WASM" \
    "${SRC_FLAGS[@]}" "${NET_FLAGS[@]}" \
    2>"$DEPLOY_LOG_DIR/bounty-deploy.stderr" | tail -n1)"
  [[ "$DRY_RUN" == "1" ]] && BOUNTY_ID="<bounty-contract-id>"
  log "Bounty contract: $BOUNTY_ID"
fi

# ---------------------------------------------------------------------------
# 10. Initialize the reputation contract.
#     This is intentionally one-time. If it was already initialized, the
#     contract returns Error::AlreadyInitialized (code 1) and this script
#     stops — it does not catch or hide that error. Re-running against an
#     already-initialized contract requires fixing the script inputs (see
#     docs/DEPLOYMENT.md "How to redeploy safely"), not silently continuing.
# ---------------------------------------------------------------------------
log "Initializing reputation contract (admin=$ADMIN_ADDRESS)"
run stellar contract invoke --id "$REPUTATION_ID" "${SRC_FLAGS[@]}" "${NET_FLAGS[@]}" \
  -- initialize --admin "$ADMIN_ADDRESS" \
  2>"$DEPLOY_LOG_DIR/reputation-init.stderr"

# ---------------------------------------------------------------------------
# 11. Initialize the bounty contract.
# ---------------------------------------------------------------------------
log "Initializing bounty contract (admin=$ADMIN_ADDRESS)"
run stellar contract invoke --id "$BOUNTY_ID" "${SRC_FLAGS[@]}" "${NET_FLAGS[@]}" \
  -- initialize --admin "$ADMIN_ADDRESS" \
  2>"$DEPLOY_LOG_DIR/bounty-init.stderr"

# ---------------------------------------------------------------------------
# 12. Wire the two contracts together, in the required order:
#     reputation must authorize the bounty contract BEFORE the bounty
#     contract is told to use it, so there is never a window where the
#     bounty contract points at a reputation contract that would reject it.
# ---------------------------------------------------------------------------
log "Reputation: authorizing bounty contract as the sole caller"
run stellar contract invoke --id "$REPUTATION_ID" "${SRC_FLAGS[@]}" "${NET_FLAGS[@]}" \
  -- set_authorized --admin "$ADMIN_ADDRESS" --bounty_contract "$BOUNTY_ID" \
  2>"$DEPLOY_LOG_DIR/set-authorized.stderr"

log "Bounty: linking reputation contract"
run stellar contract invoke --id "$BOUNTY_ID" "${SRC_FLAGS[@]}" "${NET_FLAGS[@]}" \
  -- set_reputation --admin "$ADMIN_ADDRESS" --reputation_contract "$REPUTATION_ID" \
  2>"$DEPLOY_LOG_DIR/set-reputation.stderr"

# ---------------------------------------------------------------------------
# 13. Verify both configured addresses with read-only calls.
#
#     NOTE: studystake_reputation currently exposes no getter for the
#     authorized-contract address it just accepted in step 12 — only
#     set_authorized (write) exists, not get_authorized_contract (read).
#     That direction of the wiring can only be confirmed by a real
#     record_completion call later (i.e. by actually completing a bounty),
#     or by adding a getter in a future phase. This script verifies the
#     direction that IS readable: the bounty contract's own link.
# ---------------------------------------------------------------------------
log "Verifying bounty -> reputation link (get_reputation_contract)"
VERIFIED_REPUTATION_ID="$(capture stellar contract invoke --id "$BOUNTY_ID" "${SRC_FLAGS[@]}" "${NET_FLAGS[@]}" --send=no \
  -- get_reputation_contract)"
log "Bounty contract reports linked reputation contract: $VERIFIED_REPUTATION_ID"
if [[ "$DRY_RUN" != "1" && "$VERIFIED_REPUTATION_ID" != *"$REPUTATION_ID"* ]]; then
  fail "verification failed: bounty contract's linked reputation address does not match what was just configured"
fi

# ---------------------------------------------------------------------------
# 14. Generate TypeScript bindings for both contracts, from the built wasm
#     (not from the live deployed instance, so this step needs no network
#     access and works the same in --dry-run).
# ---------------------------------------------------------------------------
log "Generating TypeScript bindings"
run stellar contract bindings typescript --wasm "$REPUTATION_WASM" --output-dir "$BINDINGS_REPUTATION_DIR" --overwrite
run stellar contract bindings typescript --wasm "$BOUNTY_WASM" --output-dir "$BINDINGS_BOUNTIES_DIR" --overwrite
if [[ "$NODE_AVAILABLE" != "1" ]]; then
  log "node not found — generated bindings are TypeScript source only; 'npm install && npm run build' in each bindings dir requires Node."
fi

# ---------------------------------------------------------------------------
# 15. Best-effort transaction hash extraction from captured stderr logs.
#     stellar CLI logs the submitted transaction hash to stderr; this is a
#     convenience for the summary, not something later steps depend on.
# ---------------------------------------------------------------------------
extract_hash() {
  local logfile="$1"
  [[ -f "$logfile" ]] || { echo "unavailable"; return; }
  grep -oE '[0-9a-f]{64}' "$logfile" | head -n1 || echo "unavailable"
}
REPUTATION_DEPLOY_TX="$(extract_hash "$DEPLOY_LOG_DIR/reputation-deploy.stderr")"
BOUNTY_DEPLOY_TX="$(extract_hash "$DEPLOY_LOG_DIR/bounty-deploy.stderr")"
REPUTATION_INIT_TX="$(extract_hash "$DEPLOY_LOG_DIR/reputation-init.stderr")"
BOUNTY_INIT_TX="$(extract_hash "$DEPLOY_LOG_DIR/bounty-init.stderr")"
SET_AUTHORIZED_TX="$(extract_hash "$DEPLOY_LOG_DIR/set-authorized.stderr")"
SET_REPUTATION_TX="$(extract_hash "$DEPLOY_LOG_DIR/set-reputation.stderr")"

# ---------------------------------------------------------------------------
# 16 & 17. Print and save the final summary. No secret ever appears here.
# ---------------------------------------------------------------------------
TIMESTAMP="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
SUMMARY_ENV_FILE="$DEPLOYMENT_OUTPUT_DIR/testnet-latest.env"
SUMMARY_JSON_FILE="$DEPLOYMENT_OUTPUT_DIR/testnet-latest.json"

read -r -d '' SUMMARY <<EOF || true
========================================================================
StudyStake Bounties — Level 3 Testnet Deployment Summary
========================================================================
Timestamp:            $TIMESTAMP
Network:               $DEPLOY_NETWORK
Deployer address:      $DEPLOYER_ADDRESS
Admin address:         $ADMIN_ADDRESS
Token id (reference):  ${DEPLOY_TOKEN_ID:-<none provided>}

Reputation contract:   $REPUTATION_ID
Bounty contract:       $BOUNTY_ID

Reputation deploy tx:  $REPUTATION_DEPLOY_TX
Bounty deploy tx:      $BOUNTY_DEPLOY_TX
Reputation init tx:    $REPUTATION_INIT_TX
Bounty init tx:        $BOUNTY_INIT_TX
set_authorized tx:     $SET_AUTHORIZED_TX
set_reputation tx:     $SET_REPUTATION_TX

Bindings (bounties):   $BINDINGS_BOUNTIES_DIR
Bindings (reputation): $BINDINGS_REPUTATION_DIR

NOTE: reputation's authorized-contract address has no read-only getter
in the current contract API, so it could not be independently verified
here — only set_authorized succeeding without error confirms it was
accepted. See docs/DEPLOYMENT.md.
========================================================================
EOF

echo "$SUMMARY"

if [[ "$DRY_RUN" != "1" ]]; then
  echo "$SUMMARY" > "$SUMMARY_ENV_FILE"
  cat > "$SUMMARY_JSON_FILE" <<JSON
{
  "timestamp": "$TIMESTAMP",
  "network": "$DEPLOY_NETWORK",
  "deployerAddress": "$DEPLOYER_ADDRESS",
  "adminAddress": "$ADMIN_ADDRESS",
  "tokenId": "${DEPLOY_TOKEN_ID:-null}",
  "reputationContract": "$REPUTATION_ID",
  "bountyContract": "$BOUNTY_ID",
  "transactions": {
    "reputationDeploy": "$REPUTATION_DEPLOY_TX",
    "bountyDeploy": "$BOUNTY_DEPLOY_TX",
    "reputationInit": "$REPUTATION_INIT_TX",
    "bountyInit": "$BOUNTY_INIT_TX",
    "setAuthorized": "$SET_AUTHORIZED_TX",
    "setReputation": "$SET_REPUTATION_TX"
  },
  "bindings": {
    "bounties": "$BINDINGS_BOUNTIES_DIR",
    "reputation": "$BINDINGS_REPUTATION_DIR"
  }
}
JSON
  log "Summary written to $SUMMARY_ENV_FILE and $SUMMARY_JSON_FILE"
else
  log "(dry run — summary not written to disk)"
fi
