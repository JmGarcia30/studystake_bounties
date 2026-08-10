import { Wallet, ArrowRight, ShieldCheck } from "lucide-react";

interface Props {
  onConnectWallet: () => void;
}

export function LandingCTA({ onConnectWallet }: Props) {
  return (
    <section className="w-full py-20 lg:py-28 px-6 border-t border-slate-800/80 bg-gradient-to-b from-[#0B1120] to-[#070B14]">
      <div className="max-w-5xl mx-auto text-center space-y-8 relative overflow-hidden p-10 sm:p-16 rounded-3xl bg-gradient-to-tr from-[#6C5CE7]/25 via-indigo-900/30 to-purple-900/20 border border-purple-500/30 shadow-2xl">
        {/* Glow Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl h-96 bg-[#6C5CE7]/25 rounded-full blur-[140px] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Ready to Get Started?
        </div>

        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight m-0">
          Join StudyStake Today &amp; <br />
          <span className="bg-gradient-to-r from-indigo-300 via-[#8B5CF6] to-purple-300 bg-clip-text text-transparent">
            Build Your On-Chain Career.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-100 max-w-2xl mx-auto font-medium m-0 leading-relaxed">
          Whether you are a scholar seeking micro-bounties or a sponsor funding educational tasks, StudyStake provides trustless Soroban escrow infrastructure.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={onConnectWallet}
            className="w-full sm:w-auto py-4 px-9 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] hover:from-[#5B4BD6] hover:to-[#7C3AED] text-white font-extrabold text-sm tracking-wide shadow-xl shadow-[#6C5CE7]/40 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
          >
            <Wallet className="w-4 h-4" />
            <span>Connect Stellar Wallet</span>
            <ArrowRight className="w-4 h-4 opacity-80" />
          </button>
        </div>
      </div>
    </section>
  );
}
