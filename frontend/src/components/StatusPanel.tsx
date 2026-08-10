import type { TxStatus } from "../lib/contract";
import { formatErrorMessage } from "../lib/errors";
import { Activity } from "lucide-react";
import { TransactionStatus, type TxStepState } from "./TransactionStatus";

interface Props {
  status: TxStatus;
  hash?: string;
  error?: string | unknown;
}

export function StatusPanel({ status, hash, error }: Props) {
  const displayError = formatErrorMessage(error);

  const getStepState = (): TxStepState => {
    switch (status) {
      case "pending":
        return "submitting";
      case "success":
        return "confirmed";
      case "failed":
        return "failed";
      default:
        return "idle";
    }
  };

  const stepState = getStepState();

  return (
    <section className="panel !bg-white !border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-200">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-purple-50 text-[#6C5CE7]">
          <Activity className="w-4 h-4" />
        </div>
        <h2 className="text-base font-bold text-slate-900 m-0">Transaction Lifecycle Status</h2>
      </div>

      {stepState === "idle" ? (
        <p className="text-xs text-slate-500 m-0 py-2 font-medium">
          Idle — No transactions initiated yet. Deposit escrow or submit bounty proof to view on-chain status.
        </p>
      ) : (
        <TransactionStatus state={stepState} hash={hash} error={displayError} />
      )}
    </section>
  );
}
