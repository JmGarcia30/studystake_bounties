import { useEffect, useState } from "react";
import { getXlmBalance } from "../lib/horizon";

interface Props {
  address: string | null;
  refreshKey: number;
}

export function BalancePanel({ address, refreshKey }: Props) {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setBalance(null);
      return;
    }
    setLoading(true);
    setError(null);
    getXlmBalance(address)
      .then(setBalance)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [address, refreshKey]);

  return (
    <section className="panel">
      <h2>Balance</h2>
      {!address && <p className="muted">Connect a wallet to see your balance.</p>}
      {address && loading && <p>Loading balance…</p>}
      {address && error && <p className="error">{error}</p>}
      {address && !loading && !error && balance !== null && (
        <p className="balance">{balance} XLM</p>
      )}
    </section>
  );
}
