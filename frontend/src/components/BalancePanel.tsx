import { useEffect, useState } from "react";
import { getXlmBalance } from "../lib/horizon";
import { Coins, ExternalLink, RefreshCw } from "lucide-react";

interface Props {
  address: string | null;
  refreshKey: number;
}

export function BalancePanel({ address, refreshKey }: Props) {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualRefreshKey, setManualRefreshKey] = useState(0);

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
  }, [address, refreshKey, manualRefreshKey]);

  return (
    <section className="panel !bg-white !border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
            <Coins className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900 m-0">Balance</h2>
        </div>
        {address && (
          <a
            href={`https://laboratory.stellar.org/#account-creator?network=testnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#6C5CE7] hover:text-[#5B4BD6] flex items-center gap-1 transition-colors underline underline-offset-2 font-semibold"
            title="Fund on Testnet Friendbot"
          >
            Friendbot <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {!address && <p className="muted text-xs text-slate-500 m-0 font-normal">Connect a wallet to see your balance.</p>}

      {address && loading && (
        <div className="flex items-center gap-2 text-slate-600 text-sm py-2">
          <RefreshCw className="w-4 h-4 animate-spin text-[#6C5CE7]" />
          <p className="m-0 text-xs">Loading balance…</p>
        </div>
      )}

      {address && error && <p className="error text-rose-600 text-xs mt-2 m-0">{error}</p>}

      {address && !loading && !error && balance !== null && (
        <div className="space-y-1">
          <p className="balance text-2xl font-black text-slate-900 tracking-tight m-0">
            {balance} XLM
          </p>
          <p className="text-[11px] text-slate-500 m-0 font-normal">Available for peer-tutoring micro escrows</p>
        </div>
      )}
      {address && (
        <button onClick={() => setManualRefreshKey((key) => key + 1)} disabled={loading}>
          Refresh Balance
        </button>
      )}
    </section>
  );
}
