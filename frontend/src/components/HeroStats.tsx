import { ShieldCheck, Lock, Coins, Award } from "lucide-react";

interface Props {
  bountyCount: number | null;
}

export function HeroStats({ bountyCount }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full">
      <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-2 text-[#1E3A8A] text-xs font-bold mb-1.5">
          <Lock className="w-4 h-4 text-[#8B5CF6]" />
          Active Soroban Escrows
        </div>
        <div className="text-2xl font-black text-[#0F172A]">
          {bountyCount !== null ? bountyCount : "—"}
        </div>
        <div className="text-[11px] text-slate-500 mt-1 font-medium">Trustless task vaults</div>
      </div>

      <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-2 text-[#1E3A8A] text-xs font-bold mb-1.5">
          <Coins className="w-4 h-4 text-teal-600" />
          Gateway Fees Saved
        </div>
        <div className="text-2xl font-black text-[#0F172A]">0.00%</div>
        <div className="text-[11px] text-slate-500 mt-1 font-medium">Direct peer payments</div>
      </div>

      <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-2 text-[#1E3A8A] text-xs font-bold mb-1.5">
          <Award className="w-4 h-4 text-amber-600" />
          Reputation Tracking
        </div>
        <div className="text-2xl font-black text-[#0F172A]">On-Chain</div>
        <div className="text-[11px] text-slate-500 mt-1 font-medium">Permanent career proof</div>
      </div>

      <div className="p-4.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center gap-2 text-[#1E3A8A] text-xs font-bold mb-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Escrow Protection
        </div>
        <div className="text-2xl font-black text-[#0F172A]">100% Guaranteed</div>
        <div className="text-[11px] text-slate-500 mt-1 font-medium">Buyer &amp; tutor safety</div>
      </div>
    </div>
  );
}
