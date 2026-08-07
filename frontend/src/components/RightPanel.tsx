import { WalletPanel } from "./WalletPanel";
import { BalancePanel } from "./BalancePanel";
import { ReputationPanel } from "./ReputationPanel";
import { StatusPanel } from "./StatusPanel";
import type { TxStatus } from "../lib/contract";
import { BarChart3, Bell, User } from "lucide-react";

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
  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      {/* Account Overview Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
            <User className="w-4 h-4 text-[#6C5CE7]" />
            <span>Account Overview</span>
          </div>
          <button
            type="button"
            className="!p-1.5 !bg-slate-50 hover:!bg-slate-100 !border-none text-slate-500 rounded-xl cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Welcome Back Text */}
        <div className="text-center py-1 space-y-0.5">
          <h3 className="text-base font-extrabold text-slate-900 m-0 border-0 p-0">
            Welcome Back!
          </h3>
          <p className="text-[11px] text-slate-500 m-0 font-normal">
            {address
              ? `Connected as ${address.slice(0, 6)}…${address.slice(-4)}`
              : "Connect wallet to lock & claim tutor escrows."}
          </p>
        </div>

        {/* Weekly Activity Metric */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-700 font-semibold">
            <span className="flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-[#6C5CE7]" />
              Weekly Bounties
            </span>
            <span className="text-[#6C5CE7] font-bold">Active</span>
          </div>

          {/* Bar Chart Graphic */}
          <div className="flex items-end justify-between gap-1.5 h-14 pt-1">
            <div className="flex-1 bg-purple-100 rounded-md h-7 hover:bg-[#6C5CE7] transition-all cursor-pointer" title="Mon: 2 tasks" />
            <div className="flex-1 bg-purple-200 rounded-md h-11 hover:bg-[#6C5CE7] transition-all cursor-pointer" title="Tue: 4 tasks" />
            <div className="flex-1 bg-purple-100 rounded-md h-5 hover:bg-[#6C5CE7] transition-all cursor-pointer" title="Wed: 1 task" />
            <div className="flex-1 bg-[#6C5CE7] rounded-md h-13 hover:bg-[#5B4BD6] transition-all cursor-pointer" title="Thu: 5 tasks" />
            <div className="flex-1 bg-purple-200 rounded-md h-9 hover:bg-[#6C5CE7] transition-all cursor-pointer" title="Fri: 3 tasks" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-medium px-0.5 pt-0.5">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
          </div>
        </div>
      </div>

      {/* Wallet Panel */}
      <WalletPanel
        address={address}
        onConnected={onConnected}
        onDisconnected={onDisconnected}
      />

      {/* Balance Panel */}
      <BalancePanel address={address} refreshKey={refreshKey} />

      {/* Reputation Panel */}
      <ReputationPanel address={address} refreshKey={refreshKey} />

      {/* Transaction Status Panel */}
      <StatusPanel status={txStatus} hash={txHash} error={txError} />
    </aside>
  );
}
