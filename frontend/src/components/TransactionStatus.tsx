import { Loader2, CheckCircle2, AlertCircle, Clock, ShieldAlert } from "lucide-react";
import { EXPLORER_TX_URL } from "../lib/config";

export type TxStepState =
  | "idle"
  | "preparing"
  | "waiting wallet approval"
  | "submitting"
  | "confirmed"
  | "failed";

interface Props {
  state: TxStepState;
  hash?: string;
  error?: string;
  onReset?: () => void;
}

export function TransactionStatus({ state, hash, error, onReset }: Props) {
  if (state === "idle") return null;

  return (
    <div
      className={`p-4 rounded-2xl border text-xs font-sans transition-all space-y-2 ${
        state === "confirmed"
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-300"
          : state === "failed"
          ? "bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-300"
          : "bg-indigo-500/10 border-indigo-500/30 text-indigo-950 dark:text-indigo-300"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 font-bold text-xs">
          {state === "preparing" && (
            <>
              <Clock className="w-4 h-4 text-indigo-500 animate-pulse" />
              <span>Preparing Soroban Transaction…</span>
            </>
          )}

          {state === "waiting wallet approval" && (
            <>
              <Loader2 className="w-4 h-4 text-[#6C5CE7] animate-spin" />
              <span>Waiting for Wallet Approval in Freighter…</span>
            </>
          )}

          {state === "submitting" && (
            <>
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
              <span>Submitting to Stellar Testnet Ledger…</span>
            </>
          )}

          {state === "confirmed" && (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Transaction Confirmed on Ledger!</span>
            </>
          )}

          {state === "failed" && (
            <>
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Transaction Execution Failed</span>
            </>
          )}
        </div>

        {onReset && (
          <button
            onClick={onReset}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline"
          >
            Dismiss
          </button>
        )}
      </div>

      {/* Hash Link */}
      {hash && (
        <div className="text-[11px] font-mono break-all pt-1 flex items-center gap-1.5">
          <span className="text-slate-500">Tx Hash:</span>
          <a
            aria-label={hash}
            href={EXPLORER_TX_URL(hash)}
            target="_blank"
            rel="noopener noreferrer"
            className="hash text-[#6C5CE7] hover:underline font-semibold"
          >
            {hash.slice(0, 12)}…{hash.slice(-10)}
          </a>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium pt-0.5 flex items-start gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
