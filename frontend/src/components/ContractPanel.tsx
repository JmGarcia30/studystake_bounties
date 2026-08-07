import { useState } from "react";
import { getConfig } from "../lib/config";
import { readContract, BOUNTY_STATUS_LABELS, type Bounty, type TxStatus } from "../lib/contract";
import { xlmToStroops } from "../lib/amount";
import { toFriendlyError } from "../lib/errors";
import { useContractAction } from "../hooks/useContractAction";

interface Props {
  address: string | null;
  onTxUpdate: (status: TxStatus, hash?: string, error?: string) => void;
  onSuccess: () => void;
}

const PENDING_LABELS = {
  initialize: "Initializing…",
  create_bounty: "Creating…",
  accept_bounty: "Accepting…",
  release_funds: "Releasing…",
} as const;

export function ContractPanel({ address, onTxUpdate, onSuccess }: Props) {
  // Read at render time (not module load) so a bad .env surfaces through
  // the ErrorBoundary with a clear message instead of a blank page.
  const { contractId, tokenId } = getConfig();
  const [token, setToken] = useState(tokenId);
  const [amount, setAmount] = useState("1");
  const [createdBountyId, setCreatedBountyId] = useState<number | null>(null);

  const [acceptId, setAcceptId] = useState("");
  const [releaseId, setReleaseId] = useState("");

  const [lookupId, setLookupId] = useState("");
  const [lookedUp, setLookedUp] = useState<Bounty | null | undefined>(undefined);
  const [count, setCount] = useState<number | null>(null);

  const { pendingAction, run } = useContractAction({ address, onTxUpdate, onSuccess });
  // Only one wallet-signed transaction can be in flight at a time, so every
  // write action stays disabled while any one of them is pending — but each
  // button only swaps to its own "…ing" label when it's the one running.
  const isBusy = pendingAction !== null;

  async function handleCreate() {
    try {
      const stroops = xlmToStroops(amount);
      const bountyId = await run("create_bounty", { buyer: address, token, amount: stroops });
      if (typeof bountyId === "number") {
        setCreatedBountyId(bountyId);
        refreshCount();
      }
    } catch (err) {
      onTxUpdate("failed", undefined, toFriendlyError(err).message);
    }
  }

  async function handleAccept() {
    await run("accept_bounty", { tutor: address, bounty_id: Number(acceptId) });
  }

  async function handleRelease() {
    await run("release_funds", { buyer: address, bounty_id: Number(releaseId) });
  }

  async function handleInitialize() {
    await run("initialize", { admin: address });
  }

  async function refreshCount() {
    try {
      const c = await readContract("get_bounty_count");
      setCount(c);
    } catch {
      // Contract may not be initialized yet — ignore for the read panel.
    }
  }

  async function handleLookup() {
    setLookedUp(undefined);
    try {
      const bounty = await readContract("get_bounty", { bounty_id: Number(lookupId) });
      setLookedUp(bounty ?? null);
    } catch (err) {
      onTxUpdate("failed", undefined, toFriendlyError(err).message);
    }
  }

  return (
    <section className="panel">
      <h2>Contract</h2>
      <p className="muted">
        Address: <code>{contractId}</code>
      </p>

      <h3>Read</h3>
      <div className="row">
        <button onClick={refreshCount}>Refresh bounty count</button>
        {count !== null && <span>Total bounties: {count}</span>}
      </div>
      <div className="row">
        <input
          placeholder="Bounty ID"
          value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
        />
        <button onClick={handleLookup} disabled={!lookupId}>
          Look up bounty
        </button>
      </div>
      {lookedUp === null && <p className="muted">No bounty with that ID.</p>}
      {lookedUp && (
        <pre className="bounty-detail">
          {JSON.stringify(
            {
              ...lookedUp,
              amount: lookedUp.amount.toString(),
              status: BOUNTY_STATUS_LABELS[lookedUp.status],
            },
            null,
            2,
          )}
        </pre>
      )}

      <h3>Write</h3>
      {!address && <p className="muted">Connect a wallet to call the contract.</p>}
      {address && (
        <>
          <div className="row">
            <button onClick={handleInitialize} disabled={isBusy}>
              {pendingAction === "initialize"
                ? PENDING_LABELS.initialize
                : "Initialize (admin = connected wallet)"}
            </button>
          </div>

          <div className="row">
            <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Token address" />
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount (XLM)"
              type="number"
              min="0"
              step="0.0000001"
            />
            <button onClick={handleCreate} disabled={isBusy}>
              {pendingAction === "create_bounty" ? PENDING_LABELS.create_bounty : "Create bounty"}
            </button>
          </div>
          {createdBountyId !== null && <p className="muted">Created bounty #{createdBountyId}</p>}

          <div className="row">
            <input
              value={acceptId}
              onChange={(e) => setAcceptId(e.target.value)}
              placeholder="Bounty ID"
            />
            <button onClick={handleAccept} disabled={isBusy || !acceptId}>
              {pendingAction === "accept_bounty"
                ? PENDING_LABELS.accept_bounty
                : "Accept bounty (tutor = connected wallet)"}
            </button>
          </div>

          <div className="row">
            <input
              value={releaseId}
              onChange={(e) => setReleaseId(e.target.value)}
              placeholder="Bounty ID"
            />
            <button onClick={handleRelease} disabled={isBusy || !releaseId}>
              {pendingAction === "release_funds"
                ? PENDING_LABELS.release_funds
                : "Release funds (buyer = connected wallet)"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
