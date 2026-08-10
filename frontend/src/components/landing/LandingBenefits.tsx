import { GraduationCap, Briefcase, CheckCircle2 } from "lucide-react";

export function LandingBenefits() {
  const studentBenefits = [
    "Earn XLM micro-rewards for completing modular tasks",
    "Build an unforgeable, on-chain career portfolio",
    "Gain practical experience on real Soroban & Web3 projects",
    "Connect directly with sponsors without platform intermediaries",
  ];

  const sponsorBenefits = [
    "Fund specific educational outcomes and bug fixes",
    "Lock rewards safely in automated smart escrows",
    "Review cryptographically verified student task proofs",
    "Discover, vet, and hire rising Web3 student talent",
  ];

  return (
    <section id="benefits" className="w-full py-20 lg:py-28 px-6 border-t border-slate-800/80 bg-[#0F172A]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white !text-white tracking-tight">
            Designed for Both Scholars &amp; Sponsors
          </h2>
          <p className="text-base text-slate-200 !text-slate-200 font-medium">
            StudyStake creates a win-win incentive loop for learners and ecosystem builders.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Column */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#6C5CE7]/10 border border-[#6C5CE7]/20 flex items-center justify-center text-[#8B5CF6]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white !text-white">For Students &amp; Scholars</h3>
                <p className="text-xs sm:text-sm text-slate-300 !text-slate-300 font-medium">Turn study hours into verified career assets</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-100 !text-slate-100 font-medium">
              {studentBenefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sponsor Column */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white !text-white">For Sponsors &amp; Guilds</h3>
                <p className="text-xs sm:text-sm text-slate-300 !text-slate-300 font-medium">Fund targeted tasks &amp; source vetted talent</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-100 !text-slate-100 font-medium">
              {sponsorBenefits.map((b, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
