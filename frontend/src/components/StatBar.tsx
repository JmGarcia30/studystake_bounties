import { Coins, CheckCircle, Award, Target, TrendingUp, Sparkles, Zap, Vault } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface Props {
  bountyCount: number | null;
}

export function StatBar({ bountyCount }: Props) {
  const { role } = useAuth();
  const isStudent = role === "student";

  if (!isStudent) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full font-sans">
        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-50 text-[#6C5CE7]">
              <Vault className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0 border-0 p-0">
                {bountyCount !== null ? `${bountyCount} Active Escrows` : "Soroban Escrows"}
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5 font-normal">
                Trustless task vaults on testnet
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0 border-0 p-0">
                0.00% Platform Fee
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5 font-normal">
                Direct peer payouts to scholars
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 m-0 border-0 p-0">
                Verified Sponsor Rating
              </h3>
              <p className="text-xs text-slate-500 m-0 mt-0.5 font-normal">
                Building trusted talent pipelines
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full font-sans">
      {/* 1. Earnings Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Earnings</span>
          <div className="p-2.5 rounded-xl bg-purple-50 text-[#6C5CE7]">
            <Coins className="w-4.5 h-4.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">18.5 XLM</div>
          <div className="text-xs text-slate-500 font-medium">Total rewards earned</div>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+5.0 XLM this week</span>
        </div>
      </div>

      {/* 2. Completed Tasks Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="w-4.5 h-4.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">4 Tasks</div>
          <div className="text-xs text-slate-500 font-medium">Verified contributions</div>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
          <Sparkles className="w-3.5 h-3.5" />
          <span>100% completion rate</span>
        </div>
      </div>

      {/* 3. Reputation Score Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reputation</span>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Award className="w-4.5 h-4.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">Level 2 Scholar</div>
          <div className="text-xs text-slate-500 font-medium">82 Reputation Score</div>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-amber-600">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>+12 XP gained this week</span>
        </div>
      </div>

      {/* 4. Available Opportunities Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Opportunities</span>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Target className="w-4.5 h-4.5" />
          </div>
        </div>
        <div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">12 Available</div>
          <div className="text-xs text-slate-500 font-medium">Matching your skills</div>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-bold text-indigo-600">
          <Zap className="w-3.5 h-3.5" />
          <span>3 New bounties added today</span>
        </div>
      </div>
    </div>
  );
}
