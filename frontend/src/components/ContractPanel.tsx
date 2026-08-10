import { useState } from "react";
import { getConfig } from "../lib/config";
import { readContract, BOUNTY_STATUS_LABELS, type Bounty, type TxStatus } from "../lib/contract";
import { xlmToStroops } from "../lib/amount";
import { toFriendlyError } from "../lib/errors";
import { useContractAction } from "../hooks/useContractAction";
import type { OptimisticActivityInput } from "../lib/optimisticActivity";
import { Code, Search, PlusCircle, CheckSquare, Unlock, ShieldAlert, Database, Send } from "lucide-react";

interface Props {
  address: string | null;
  onTxUpdate: (status: TxStatus, hash?: string, error?: string) => void;
  onSuccess: () => void;
  onActivity?: (activity: OptimisticActivityInput) => void;
  selectedAmountPreset?: string;
  selectedBountyIdPreset?: number;
}

const PENDING_LABELS = {
  initialize: "Initializing…",
  create_bounty: "Creating…",
  accept_bounty: "Accepting…",
  release_funds: "Releasing…",
} as const;

export function ContractPanel({
  address,
  onTxUpdate,
  onSuccess,
  onActivity,
  selectedAmountPreset,
  selectedBountyIdPreset,
}: Props) {
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
  const isBusy = pendingAction !== null;

  if (selectedAmountPreset && selectedAmountPreset !== amount) {
    setAmount(selectedAmountPreset);
  }
  if (selectedBountyIdPreset && String(selectedBountyIdPreset) !== acceptId) {
    setAcceptId(String(selectedBountyIdPreset));
    setReleaseId(String(selectedBountyIdPreset));
  }

  async function handleCreate() {
    try {
      const stroops = xlmToStroops(amount);
      const bountyId = await run("create_bounty", { buyer: address, token, amount: stroops });
      if (typeof bountyId === "number") {
        setCreatedBountyId(bountyId);
        refreshCount();
        onActivity?.({ action: "created", bountyId, actor: address!, amount: stroops });
      }
    } catch (err) {
      onTxUpdate("failed", undefined, toFriendlyError(err).message);
    }
  }

  async function handleAccept() {
    const bountyId = Number(acceptId);
    const result = await run("accept_bounty", { tutor: address, bounty_id: bountyId });
    if (result !== undefined) {
      onActivity?.({ action: "accepted", bountyId, actor: address! });
    }
  }

  async function handleRelease() {
    const bountyId = Number(releaseId);
    const result = await run("release_funds", { buyer: address, bounty_id: bountyId });
    if (result !== undefined) {
      onActivity?.({ action: "released", bountyId, actor: address! });
    }
  }

  async function handleInitialize() {
    const result = await run("initialize", { admin: address });
    if (result !== undefined) {
      onActivity?.({ action: "initialized", bountyId: null, actor: address! });
    }
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
    <section className="panel !bg-white !border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-200">
      <div className="flex items-center gap-2 mb-2">
        <div className="p-2 rounded-xl bg-purple-50 text-[#6C5CE7]">
          <Code className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-slate-900 m-0">Contract</h2>
      </div>

      <p className="muted text-xs text-slate-500 mb-4 m-0 flex items-center gap-1.5 flex-wrap">
        Address: <code className="text-slate-900 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200 break-all font-bold">{contractId}</code>
      </p>

      {/* READ SECTION */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-5 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-xs border-b border-slate-200/80 pb-2">
          <Database className="w-4 h-4 text-[#6C5CE7]" />
          <h3 className="m-0 text-xs border-0 p-0 text-slate-900 font-bold">Read</h3>
        </div>

        <div className="row flex items-center gap-3">
          <button
            onClick={refreshCount}
            className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-xs font-semibold rounded-xl px-3 py-2 transition-all cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 shrink-0 text-[#6C5CE7]" />
            <span>Refresh bounty count</span>
          </button>
          {count !== null && (
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              Total bounties: {count}
            </span>
          )}
        </div>

        <div className="row flex items-center gap-2">
          <div className="relative flex-1">
            <input
              placeholder="Bounty ID"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              className="w-full bg-white border-slate-200 text-xs py-2 px-3 rounded-xl focus:border-[#6C5CE7] text-slate-900"
            />
          </div>
          <button
            onClick={handleLookup}
            disabled={!lookupId}
            className="inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs border border-slate-900 font-bold rounded-xl px-3.5 py-2 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span>Look up bounty</span>
          </button>
        </div>

        {lookedUp === null && <p className="muted text-xs text-rose-600 m-0">No bounty with that ID.</p>}
        {lookedUp && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
              <span>Soroban Bounty Details:</span>
              <span className="px-2 py-0.5 rounded bg-purple-50 text-[#6C5CE7] font-bold border border-purple-200">
                Status: {BOUNTY_STATUS_LABELS[lookedUp.status]}
              </span>
            </div>
            <pre className="bounty-detail bg-white p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-900 overflow-x-auto m-0">
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
          </div>
        )}
      </div>

      {/* WRITE SECTION */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Send className="w-4 h-4 text-[#6C5CE7]" />
            <h3 className="m-0 text-xs border-0 p-0 text-slate-900 font-bold">Write</h3>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">Escrow Actions</span>
        </div>

        {!address ? (
          <p className="muted text-xs text-slate-500 m-0 p-3 rounded-xl bg-white border border-slate-200">
            Connect a wallet to call the contract.
          </p>
        ) : (
          <div className="space-y-3">
            {/* Initialize */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-2">
              <div className="row flex items-center justify-between gap-2">
                <button
                  onClick={handleInitialize}
                  disabled={isBusy}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold rounded-xl py-2 px-3 transition-all cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  <span>
                    {pendingAction === "initialize"
                      ? PENDING_LABELS.initialize
                      : "Initialize (admin = connected wallet)"}
                  </span>
                </button>
              </div>
            </div>

            {/* Create Bounty */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                Create Tutor Escrow Bounty
              </div>
              <div className="row flex items-center gap-2 flex-wrap">
                <input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Token address"
                  className="bg-slate-50 border-slate-200 text-xs py-2 px-3 rounded-xl text-slate-900"
                />
                <input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Amount (XLM)"
                  type="number"
                  min="0"
                  step="0.0000001"
                  className="bg-slate-50 border-slate-200 text-xs py-2 px-3 rounded-xl text-slate-900"
                />
                <button
                  onClick={handleCreate}
                  disabled={isBusy}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white border border-purple-400/30 text-xs font-semibold shadow-xs rounded-xl px-3.5 py-2 transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{pendingAction === "create_bounty" ? PENDING_LABELS.create_bounty : "Create bounty"}</span>
                </button>
              </div>
              {createdBountyId !== null && (
                <p className="muted text-xs text-emerald-700 font-bold m-0 bg-emerald-50 p-2 rounded border border-emerald-200">
                  Created bounty #{createdBountyId}
                </p>
              )}
            </div>

            {/* Accept Bounty */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                Accept Peer Tutoring Task
              </div>
              <div className="row flex items-center gap-2 flex-wrap">
                <input
                  value={acceptId}
                  onChange={(e) => setAcceptId(e.target.value)}
                  placeholder="Bounty ID"
                  className="bg-slate-50 border-slate-200 text-xs py-2 px-3 rounded-xl text-slate-900"
                />
                <button
                  onClick={handleAccept}
                  disabled={isBusy || !acceptId}
                  className="inline-flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white border border-amber-500/30 text-xs font-semibold shadow-xs rounded-xl px-3.5 py-2 transition-all cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {pendingAction === "accept_bounty"
                      ? PENDING_LABELS.accept_bounty
                      : "Accept bounty (tutor = connected wallet)"}
                  </span>
                </button>
              </div>
            </div>

            {/* Release Funds */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5 text-teal-600" />
                Confirm &amp; Release Escrowed Payment
              </div>
              <div className="row flex items-center gap-2 flex-wrap">
                <input
                  value={releaseId}
                  onChange={(e) => setReleaseId(e.target.value)}
                  placeholder="Bounty ID"
                  className="bg-slate-50 border-slate-200 text-xs py-2 px-3 rounded-xl text-slate-900"
                />
                <button
                  onClick={handleRelease}
                  disabled={isBusy || !releaseId}
                  className="inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white border border-teal-500/30 text-xs font-semibold shadow-xs rounded-xl px-3.5 py-2 transition-all cursor-pointer"
                >
                  <Unlock className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {pendingAction === "release_funds"
                      ? PENDING_LABELS.release_funds
                      : "Release funds (buyer = connected wallet)"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
