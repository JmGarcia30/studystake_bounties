import type { TxStatus } from "../lib/contract";
import { EXPLORER_TX_URL } from "../lib/config";
import { formatErrorMessage } from "../lib/errors";
import { Activity, CheckCircle2, AlertTriangle, Clock, ExternalLink } from "lucide-react";

interface Props {
  status: TxStatus;
  hash?: string;
  error?: string | unknown;
}

const LABELS: Record<TxStatus, string> = {
  idle: "Idle — no transaction yet",
  pending: "Pending — preparing, signing, or submitting…",
  success: "Success",
  failed: "Failed",
};

export function StatusPanel({ status, hash, error }: Props) {
  const displayError = formatErrorMessage(error);

  return (
    <section className="panel !bg-white !border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-purple-50 text-[#6C5CE7]">
          <Activity className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-slate-900 m-0">Transaction Status</h2>
      </div>

      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center gap-2">
          {status === "idle" && <Clock className="w-4 h-4 text-slate-400" />}
          {status === "pending" && <Clock className="w-4 h-4 text-amber-600 animate-spin" />}
          {status === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          {status === "failed" && <AlertTriangle className="w-4 h-4 text-rose-600" />}

          <p className={`status status-${status} font-bold text-sm m-0`}>
            {LABELS[status]}
          </p>
        </div>

        {status === "failed" && displayError && (
          <p className="error text-rose-700 text-xs mt-1 bg-rose-50 p-2.5 rounded-xl border border-rose-200 m-0 font-medium break-all">
            {displayError}
          </p>
        )}

        {hash && (
          <p className="text-xs text-slate-700 m-0 pt-2 border-t border-slate-200 flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-500 font-medium">Tx hash:</span>
            <a
              className="hash font-mono text-[#6C5CE7] hover:text-[#5B4BD6] flex items-center gap-1 underline font-semibold"
              href={EXPLORER_TX_URL(hash)}
              target="_blank"
              rel="noreferrer"
            >
              {hash}
              <ExternalLink className="w-3 h-3 inline" />
            </a>
          </p>
        )}
      </div>
    </section>
  );
}
