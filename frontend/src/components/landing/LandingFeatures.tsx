import { Coins, Award, Users, ShieldCheck, Zap } from "lucide-react";

export function LandingFeatures() {
  const benefits = [
    {
      icon: <Coins className="w-6 h-6 text-emerald-400" />,
      title: "Earn Real Rewards",
      desc: "Complete meaningful educational tasks and receive direct, transparent XLM micro-payouts with zero platform fees.",
    },
    {
      icon: <Award className="w-6 h-6 text-[#8B5CF6]" />,
      title: "Build Your Reputation",
      desc: "Every completed micro-bounty strengthens your verifiable on-chain career profile and earns verifiable skill badges.",
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-300" />,
      title: "Connect With Sponsors",
      desc: "Showcase your real skill capabilities beyond traditional resumes and connect directly with global Web3 sponsors.",
    },
  ];

  return (
    <section id="features" className="w-full py-20 lg:py-28 px-6 border-t border-slate-800/80 bg-[#0B1120] relative">
      <div className="max-w-6xl mx-auto space-y-16">

        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#8B5CF6] text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5" />
            <span>Platform Benefits</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white !text-white tracking-tight">
            Designed for Scholars &amp; Talent Mobility
          </h2>
          <p className="text-base text-slate-200 !text-slate-200 font-medium">
            StudyStake turns study hours into verifiable professional growth and real micro-payouts.
          </p>
        </div>

        {/* 3 Main Benefit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-[#6C5CE7]/50 shadow-xl transition-all duration-300 space-y-5 hover:-translate-y-1 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                {b.icon}
              </div>
              <h3 className="text-xl font-bold text-white !text-white group-hover:text-indigo-200 transition-colors">
                {b.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 !text-slate-200 leading-relaxed font-medium">
                {b.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Underlying Trust Enabler Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 flex items-center justify-center text-[#8B5CF6] shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white !text-white">Powered by Stellar Soroban Smart Contracts</h4>
              <p className="text-xs sm:text-sm text-slate-200 !text-slate-200 font-medium mt-0.5">
                Automated escrows ensure rewards remain 100% safe until task proof passes sponsor review.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl shrink-0">
            Stellar Testnet Infrastructure
          </span>
        </div>

      </div>
    </section>
  );
}
