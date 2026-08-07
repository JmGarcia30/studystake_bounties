import { Code, Coins, Award } from "lucide-react";

interface Props {
  bountyCount: number | null;
}

export function StatBar({ bountyCount }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      {/* Stat Card 1 */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/60 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center gap-3.5">
        <div className="p-3 rounded-xl bg-purple-50 text-[#6C5CE7]">
          <Code className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-900 m-0 border-0 p-0">
            {bountyCount !== null ? `${bountyCount} Active Escrows` : "Soroban Escrows"}
          </h3>
          <p className="text-[11px] text-slate-500 m-0 mt-0.5 font-normal">
            Trustless task vaults on testnet
          </p>
        </div>
      </div>

      {/* Stat Card 2 */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/60 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center gap-3.5">
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
          <Coins className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-900 m-0 border-0 p-0">
            0.00% Gateway Fees
          </h3>
          <p className="text-[11px] text-slate-500 m-0 mt-0.5 font-normal">
            Direct peer payouts to tutors
          </p>
        </div>
      </div>

      {/* Stat Card 3 */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/60 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center gap-3.5">
        <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
          <Award className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-slate-900 m-0 border-0 p-0">
            Yellow Belt Level
          </h3>
          <p className="text-[11px] text-slate-500 m-0 mt-0.5 font-normal">
            Permanent on-chain career proof
          </p>
        </div>
      </div>
    </div>
  );
}
