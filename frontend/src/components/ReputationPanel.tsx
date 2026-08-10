import { useEffect, useState } from "react";
import { fetchReputation, isReputationConfigured, type Reputation } from "../lib/reputation";
import { Award, RefreshCw, Star } from "lucide-react";

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
    <section className="panel !bg-white !border-gray-200 shadow-xs relative overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
            <Award className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 m-0">Reputation</h2>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1 font-bold">
          <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
          Yellow Belt
        </span>
      </div>

      {!configured && <p className="muted text-xs text-gray-500 m-0">Reputation contract not configured yet.</p>}
      
      {configured && !address && (
        <p className="muted text-xs text-gray-500 m-0">Connect a wallet to see your tutor reputation.</p>
      )}
      
      {configured && address && loading && (
        <div className="flex items-center gap-2 text-gray-600 text-sm py-2">
          <RefreshCw className="w-4 h-4 animate-spin text-cyan-500" />
          <p className="muted text-xs text-gray-500 m-0">Loading reputation…</p>
        </div>
      )}
      
      {configured && address && error && <p className="error text-rose-600 text-xs mt-2 m-0">{error}</p>}
      
      {configured && address && !loading && !error && reputation === null && (
        <p className="muted text-xs text-gray-500 m-0">No completed bounties yet.</p>
      )}
      
      {configured && address && !loading && !error && reputation !== null && (
        <div className="space-y-2">
          <div className="row flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-700">
            <span className="font-bold text-gray-900">Completed: {reputation.completed}</span>
            <span className="font-mono text-gray-600 font-medium">Volume: {reputation.volume.toString()} stroops</span>
          </div>
        </div>
      )}
    </section>
  );
}
