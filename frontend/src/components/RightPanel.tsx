import { useState } from "react";
import { WalletPanel } from "./WalletPanel";
import { BalancePanel } from "./BalancePanel";
import { StatusPanel } from "./StatusPanel";
import type { TxStatus } from "../lib/contract";
import { User, Copy, Check, ExternalLink, Trophy, Award, CheckCircle2, Coins, Sparkles } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface Props {
  address: string | null;
  refreshKey: number;
  txStatus: TxStatus;
  txHash?: string;
  txError?: string;
  onConnected: (address: string) => void;
  onDisconnected: () => void;
}

export function RightPanel({
  address,
  refreshKey,
  txStatus,
  txHash,
  txError,
  onConnected,
  onDisconnected,
}: Props) {
  const { userProfile, role } = useAuth();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayName = userProfile?.name || "JM Garcia";
  const username = userProfile?.username || "@jm_garcia";
  const profileRole = role === "student" ? "Student Scholar" : "Sponsor";

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6 font-sans">
      
      {/* 1. Student Profile & Progress Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-indigo-500 text-white font-extrabold text-base flex items-center justify-center shadow-md shrink-0">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-slate-900 m-0 truncate">
              {displayName}
            </h3>
            <p className="text-xs text-slate-500 m-0 truncate font-medium">
              {username} &bull; <strong className="text-[#6C5CE7]">{profileRole}</strong>
            </p>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Profile Completion</span>
            <span className="text-[#6C5CE7] font-extrabold">80%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#6C5CE7] to-indigo-500 rounded-full w-[80%]" />
          </div>
          <p className="text-[10px] text-slate-400 font-medium pt-0.5">
            Add GitHub repo &amp; portfolio to reach 100%
          </p>
        </div>
      </div>

      {/* 2. Connected Wallet & Balance Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Connected Wallet</span>
          <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Stellar Testnet
          </span>
        </div>

        {address ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/60">
              <span className="font-mono text-xs font-bold text-slate-800">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                title="Copy Address"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-purple-700 font-semibold uppercase tracking-wider">Stellar Balance</div>
                <div className="text-xl font-black text-[#6C5CE7] font-mono mt-0.5">
                  <BalancePanel address={address} refreshKey={refreshKey} />
                </div>
              </div>
              <Coins className="w-6 h-6 text-[#6C5CE7]" />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://stellar.expert/explorer/testnet/account/${address}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <span>View on Explorer</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        ) : (
          <WalletPanel address={address} onConnected={onConnected} onDisconnected={onDisconnected} />
        )}
      </div>

      {/* 3. Gamified Reputation & Badge Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Scholar Gamification</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#6C5CE7] font-bold text-[10px] border border-purple-100">
            Level 2
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold text-slate-900">Scholar Level 2</div>
              <div className="text-xs text-slate-500 font-medium">450 / 1000 XP to Level 3</div>
            </div>
            <Award className="w-8 h-8 text-amber-500" />
          </div>

          {/* XP Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-[#6C5CE7] rounded-full w-[45%]" />
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs">
            <span className="font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Next Goal: Top Contributor Badge
            </span>
            <span className="text-[10px] font-extrabold text-amber-700 uppercase">2 Bounties Left</span>
          </div>
        </div>
      </div>

      {/* 4. Recent Activity Timeline Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-900">Recent Activity</span>
          <span className="text-[11px] text-[#6C5CE7] font-bold">Live</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Completed React Challenge</div>
              <div className="text-[11px] text-emerald-600 font-semibold">+5.0 XLM Earned &bull; Today</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Reputation Badge Unlocked</div>
              <div className="text-[11px] text-slate-500 font-medium">Scholar Level 2 &bull; Yesterday</div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">Account Verified on Stellar</div>
              <div className="text-[11px] text-slate-500 font-medium">3 days ago</div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Status Panel */}
      <StatusPanel status={txStatus} hash={txHash} error={txError} />
    </aside>
  );
}
