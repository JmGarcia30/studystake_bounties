import { useEffect, useState } from "react";
import { fetchReputation, isReputationConfigured, type Reputation } from "../lib/reputation";

interface Props {
  address: string | null;
  refreshKey: number;
}

export function ReputationPanel({ address, refreshKey }: Props) {
  const [reputation, setReputation] = useState<Reputation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = isReputationConfigured();

  useEffect(() => {
    if (!configured || !address) {
      setReputation(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchReputation(address)
      .then(setReputation)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  }, [configured, address, refreshKey]);

  return (
    <section className="panel">
      <h2>Reputation</h2>
      {!configured && <p className="muted">Reputation contract not configured yet.</p>}
      {configured && !address && (
        <p className="muted">Connect a wallet to see your tutor reputation.</p>
      )}
      {configured && address && loading && <p className="muted">Loading reputation…</p>}
      {configured && address && error && <p className="error">{error}</p>}
      {configured && address && !loading && !error && reputation === null && (
        <p className="muted">No completed bounties yet.</p>
      )}
      {configured && address && !loading && !error && reputation !== null && (
        <div className="row">
          <span>Completed: {reputation.completed}</span>
          <span>Volume: {reputation.volume.toString()} stroops</span>
        </div>
      )}
    </section>
  );
}
