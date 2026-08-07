import { ArrowRight, ShieldCheck } from "lucide-react";

interface Props {
  onExploreClick: () => void;
}

export function HeroBanner({ onExploreClick }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#8E7CFF] p-6 sm:p-7 text-white shadow-md shadow-purple-500/10">
      {/* Abstract background shapes on the right */}
      <div className="absolute -top-10 -right-10 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 max-w-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] font-bold uppercase tracking-wider text-purple-100">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
          Stellar Soroban Infrastructure
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-white leading-tight tracking-tight m-0 border-0 p-0">
          Turn Learning into Verified Livelihoods &amp; Career Proof
        </h2>

        <p className="text-xs text-purple-100/90 leading-relaxed m-0 font-normal line-clamp-2">
          StudyStake connects students and sponsors in a trustless ecosystem. Lock crypto micro-payouts in smart contract escrows and build an unforgeable portfolio.
        </p>

        <div className="pt-1">
          <button
            type="button"
            onClick={onExploreClick}
            className="!bg-white !text-[#6C5CE7] hover:!bg-purple-50 !border-none font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-2"
          >
            <span>Explore Bounties</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#6C5CE7]" />
          </button>
        </div>
      </div>
    </div>
  );
}
