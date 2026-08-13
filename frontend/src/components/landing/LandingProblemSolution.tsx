import { AlertCircle, CheckCircle2 } from "lucide-react";

export function LandingProblemSolution() {
  return (
    <section id="problem-solution" className="w-full py-20 lg:py-28 px-6 border-t border-slate-800/80 bg-[#0F172A]">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white !text-white tracking-tight">
            Bridging the Gap Between Learning &amp; Opportunity
          </h2>
          <p className="text-base sm:text-lg text-slate-200 !text-slate-200 font-medium">
            Traditional educational and freelance platforms are bogged down by high commission fees, delayed payouts, and unverified credentials.
          </p>
        </div>

        {/* Side by Side Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Problem Card */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-rose-500/30 space-y-6 relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white !text-white">The Traditional Friction</h3>
            </div>

            <ul className="space-y-4 text-sm sm:text-base text-slate-200 !text-slate-200 font-medium">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 mt-2" />
                <span>
                  <strong className="text-white !text-white font-bold">High Platform Fees:</strong> Up to 20% commission stripped from student micro-earnings.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 mt-2" />
                <span>
                  <strong className="text-white !text-white font-bold">Unverified Portfolios:</strong> Resumes and self-reported skills lack verifiable proof of work.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0 mt-2" />
                <span>
                  <strong className="text-white !text-white font-bold">Payment Disputes:</strong> Disconnected payout systems cause delays and sponsor uncertainty.
                </span>
              </li>
            </ul>
          </div>

          {/* Solution Card */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-[#6C5CE7]/40 space-y-6 relative overflow-hidden shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 flex items-center justify-center text-[#8B5CF6]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white !text-white">The StudyStake Solution</h3>
            </div>

            <ul className="space-y-4 text-sm sm:text-base text-slate-200 !text-slate-200 font-medium">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0 mt-2" />
                <span>
                  <strong className="text-white !text-white font-bold">Zero Gateway Fees:</strong> Direct XLM payouts via Stellar network with minimal ledger fees.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0 mt-2" />
                <span>
                  <strong className="text-white !text-white font-bold">On-Chain Reputation:</strong> Completed bounties generate immutable, cryptographic proof of skill.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-[#8B5CF6] shrink-0 mt-2" />
                <span>
                  <strong className="text-white !text-white font-bold">Automated Smart Escrow:</strong> Soroban contract locks reward funds safely until milestone proof passes review.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
