import { useState } from "react";
import { connectWallet, disconnectWallet } from "../lib/wallet";
import { Wallet, LogOut, ShieldCheck, Copy, Check } from "lucide-react";

interface Props {
  address: string | null;
  onConnected: (address: string) => void;
  onDisconnected: () => void;
}

export function WalletPanel({ address, onConnected, onDisconnected }: Props) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleConnect() {
    setConnecting(true);
    setError(null);
    try {
      const addr = await connectWallet();
      onConnected(addr);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setError(null);
    try {
      await disconnectWallet();
      onDisconnected();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  function copyAddress() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="panel !bg-white !border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 text-[#6C5CE7]">
            <Wallet className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-slate-900 m-0">Wallet</h2>
        </div>
        <span className="network-badge bg-slate-100 text-slate-700 border-slate-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          Stellar Testnet
        </span>
      </div>

      {address ? (
        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </span>
              <button
                type="button"
                onClick={copyAddress}
                className="!p-1 !bg-transparent !border-none text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="address text-xs font-mono text-slate-900 break-all m-0 font-bold">
              Connected: <code>{address}</code>
            </p>
          </div>

          <button
            onClick={handleDisconnect}
            className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold rounded-xl text-xs py-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Disconnect Wallet</span>
          </button>
          {error && <p className="error text-rose-600 text-xs mt-2">{error}</p>}
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 m-0 leading-relaxed font-normal">
            Connect your Freighter, Albedo, or Lobstr wallet to lock &amp; release tutor escrows.
          </p>
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-2 bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white border border-purple-400/30 shadow-xs font-bold rounded-xl py-2.5 text-xs transition-all cursor-pointer"
          >
            <Wallet className="w-4 h-4 shrink-0" />
            <span>{connecting ? "Connecting…" : "Connect Wallet"}</span>
          </button>
          {error && <p className="error text-rose-600 text-xs mt-2">{error}</p>}
        </div>
      )}
    </section>
  );
}
