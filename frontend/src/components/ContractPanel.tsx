import { useState } from "react";
import { CONTRACT_ID, TOKEN_ID } from "../lib/config";
import { callContract, readContract, BOUNTY_STATUS_LABELS, type Bounty, type TxStatus } from "../lib/contract";
import { xlmToStroops } from "../lib/amount";

interface Props {
  address: string | null;
  onTxUpdate: (status: TxStatus, hash?: string, error?: string) => void;
  onSuccess: () => void;
}

export function ContractPanel({ address, onTxUpdate, onSuccess }: Props) {
  const [token, setToken] = useState(TOKEN_ID);
  const [amount, setAmount] = useState("1");
  const [createdBountyId, setCreatedBountyId] = useState<number | null>(null);

  const [acceptId, setAcceptId] = useState("");
  const [releaseId, setReleaseId] = useState("");

  const [lookupId, setLookupId] = useState("");
  const [lookedUp, setLookedUp] = useState<Bounty | null | undefined>(undefined);
  const [count, setCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function runWrite<K extends "initialize" | "create_bounty" | "accept_bounty" | "release_funds">(
    method: K,
    args: Record<string, unknown>,
  ) {
    if (!address) return undefined;
    setBusy(true);
    const { hash, result, error } = await callContract(method, args as never, address, (status) =>
      onTxUpdate(status),
    );
    setBusy(false);
    if (error) {
      onTxUpdate("failed", undefined, error);
      return undefined;
    }
    onTxUpdate("success", hash);
    onSuccess();
    return result;
  }

  async function handleCreate() {
    try {
      const stroops = xlmToStroops(amount);
      const bountyId = await runWrite("create_bounty", { buyer: address, token, amount: stroops });
      if (typeof bountyId === "number") {
        setCreatedBountyId(bountyId);
        refreshCount();
      }
    } catch (err) {
      onTxUpdate("failed", undefined, err instanceof Error ? err.message : String(err));
    }
  }

  async function handleAccept() {
    await runWrite("accept_bounty", { tutor: address, bounty_id: Number(acceptId) });
  }

  async function handleRelease() {
    await runWrite("release_funds", { buyer: address, bounty_id: Number(releaseId) });
  }

  async function handleInitialize() {
    await runWrite("initialize", { admin: address });
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
      onTxUpdate("failed", undefined, err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <section className="panel">
      <h2>Contract</h2>
      <p className="muted">
        Address: <code>{CONTRACT_ID}</code>
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
            <button onClick={handleInitialize} disabled={busy}>
              Initialize (admin = connected wallet)
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
            <button onClick={handleCreate} disabled={busy}>
              Create bounty
            </button>
          </div>
          {createdBountyId !== null && <p className="muted">Created bounty #{createdBountyId}</p>}

          <div className="row">
            <input
              value={acceptId}
              onChange={(e) => setAcceptId(e.target.value)}
              placeholder="Bounty ID"
            />
            <button onClick={handleAccept} disabled={busy || !acceptId}>
              Accept bounty (tutor = connected wallet)
            </button>
          </div>

          <div className="row">
            <input
              value={releaseId}
              onChange={(e) => setReleaseId(e.target.value)}
              placeholder="Bounty ID"
            />
            <button onClick={handleRelease} disabled={busy || !releaseId}>
              Release funds (buyer = connected wallet)
            </button>
          </div>
        </>
      )}
    </section>
  );
}
