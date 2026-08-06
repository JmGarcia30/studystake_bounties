import type { TxStatus } from "../lib/contract";
import { EXPLORER_TX_URL } from "../lib/config";

interface Props {
  status: TxStatus;
  hash?: string;
  error?: string;
}

const LABELS: Record<TxStatus, string> = {
  idle: "Idle — no transaction yet",
  pending: "Pending — preparing, signing, or submitting…",
  success: "Success",
  failed: "Failed",
};

export function StatusPanel({ status, hash, error }: Props) {
  return (
    <section className="panel">
      <h2>Transaction Status</h2>
      <p className={`status status-${status}`}>{LABELS[status]}</p>
      {status === "failed" && error && <p className="error">{error}</p>}
      {hash && (
        <p>
          Tx hash:{" "}
          <a href={EXPLORER_TX_URL(hash)} target="_blank" rel="noreferrer">
            {hash}
          </a>
        </p>
      )}
    </section>
  );
}
