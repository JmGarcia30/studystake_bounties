import { ArrowRight, GraduationCap, Briefcase, Award, Coins, Target, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

interface Props {
  onExploreClick: () => void;
}

export function HeroBanner({ onExploreClick }: Props) {
  const { role, userProfile } = useAuth();

  const isStudent = role === "student";
  const displayName = userProfile?.name || "JM Garcia";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#6C5CE7] via-[#7C3AED] to-[#4F46E5] p-6 sm:p-8 text-white shadow-xl shadow-purple-500/10 font-sans">
      {/* Abstract Background Web3 Ambient Shapes */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      <div className="relative z-10 space-y-6">
        
        {/* Top Role Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-purple-100">
          {isStudent ? (
            <>
              <GraduationCap className="w-3.5 h-3.5 text-purple-200" />
              <span>Student Scholar Command Center</span>
            </>
          ) : (
            <>
              <Briefcase className="w-3.5 h-3.5 text-purple-200" />
              <span>Sponsor Talent Hub</span>
            </>
          )}
        </div>

        {/* Personalized Heading & Subtitle */}
        <div className="space-y-2 max-w-2xl">
          <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight m-0 p-0">
            Good afternoon, {displayName}
          </h2>
          <p className="text-sm sm:text-base text-purple-100/90 leading-relaxed m-0 font-medium">
            {isStudent
              ? "You have 12 open opportunities matching your skills."
              : "Sponsor educational bounties, review task submissions, and fund student talent."}
          </p>
        </div>

        {/* Quick Achievement Visual Cards Grid */}
        {isStudent && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 max-w-3xl">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-0.5">
              <div className="text-[10px] font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-300" />
                Reputation
              </div>
              <div className="text-sm font-extrabold text-white">Level 2 Scholar</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-0.5">
              <div className="text-[10px] font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                Completed
              </div>
              <div className="text-sm font-extrabold text-white">4 Tasks</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-0.5">
              <div className="text-[10px] font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1">
                <Coins className="w-3 h-3 text-yellow-300" />
                Earned XLM
              </div>
              <div className="text-sm font-extrabold text-white">18.5 XLM</div>
            </div>

            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-0.5">
              <div className="text-[10px] font-bold text-purple-200 uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-200" />
                Available
              </div>
              <div className="text-sm font-extrabold text-white">12 Opportunities</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onExploreClick}
            className="!bg-white !text-[#6C5CE7] hover:!bg-purple-50 !border-none font-bold text-xs px-5 py-3 rounded-xl shadow-md cursor-pointer transition-all duration-200 hover:scale-[1.02] flex items-center gap-2"
          >
            <span>{isStudent ? "Explore Bounties" : "Create Escrow Bounty"}</span>
            <ArrowRight className="w-4 h-4 text-[#6C5CE7]" />
          </button>
        </div>

      </div>
    </div>
  );
}
