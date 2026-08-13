import { Wallet, ArrowRight, CheckCircle2, Coins, Lock, Trophy, Zap, Check } from "lucide-react";

interface Props {
  onConnectWallet: () => void;
  onExploreBounties: () => void;
}

export function LandingHero({ onConnectWallet, onExploreBounties }: Props) {
  return (
    <section id="hero" className="relative w-full min-h-[90vh] py-16 lg:py-24 px-6 overflow-hidden flex items-center bg-[#0B1120] font-sans">
      {/* Ambient Lighting & Background Grid Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(108,92,231,0.28),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-[450px] h-[450px] bg-purple-600/12 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-indigo-600/12 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">

        {/* Left Column: Product Messaging & CTAs */}
        <div className="lg:col-span-7 space-y-8 text-left">

          {/* Product Identity Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-[#8B5CF6] text-xs font-bold uppercase tracking-wider shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>STUDENT TALENT MARKETPLACE &bull; STELLAR SOROBAN</span>
          </div>

          {/* Primary Headline with Gradient Accents */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] m-0 drop-shadow-md">
            Earn by learning. <br />
            Turn your{" "}
            <span className="bg-gradient-to-r from-[#6C5CE7] via-[#8B5CF6] to-indigo-300 bg-clip-text text-transparent">
              skills
            </span>{" "}
            into{" "}
            <span className="bg-gradient-to-r from-indigo-300 via-[#8B5CF6] to-purple-400 bg-clip-text text-transparent">
              opportunities
            </span>
            .
          </h1>

          {/* Supporting Description */}
          <p className="text-lg sm:text-xl text-slate-200 font-medium leading-relaxed max-w-2xl m-0">
            StudyStake connects scholars and sponsors through educational micro-bounties, transparent smart contract escrow, and verifiable reputation.
          </p>

          {/* Product Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            <button
              onClick={onConnectWallet}
              className="py-4 px-8 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] hover:from-[#5B4BD6] hover:to-[#7C3AED] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#6C5CE7]/30 border border-purple-400/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Wallet className="w-4.5 h-4.5 text-purple-200 group-hover:rotate-12 transition-transform" />
              <span>Connect Stellar Wallet</span>
            </button>

            <button
              onClick={onExploreBounties}
              className="py-4 px-7 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-md font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </button>
          </div>

          {/* Prominent Trust Indicators Row */}
          <div className="pt-6 border-t border-slate-800/80">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm font-semibold text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Smart Contract Escrow</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Student Reputation</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Transparent Rewards</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Stellar Powered</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Layered Live Product Preview */}
        <div className="lg:col-span-5 relative w-full flex items-center justify-center pt-6 lg:pt-0">
          <div className="relative w-full max-w-lg space-y-4">

            {/* Card 1: Main Bounty Marketplace Preview Card */}
            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-4 relative z-20 animate-float-slow hover:border-[#6C5CE7]/60 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Web Development
                </span>
                <span className="text-xs font-mono font-extrabold text-[#6C5CE7] bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-xl flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-[#6C5CE7]" />
                  5.0 XLM
                </span>
              </div>

              <div>
                <h4 className="text-base font-bold text-white mb-1">React Portfolio Website</h4>
                <p className="text-xs text-slate-200 leading-relaxed font-medium line-clamp-2">
                  Create a responsive React &amp; Tailwind CSS student portfolio to showcase Soroban smart contract achievements.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <span className="text-[11px]">Sponsor:</span>
                  <span className="font-bold text-white flex items-center gap-1">
                    Verified Sponsor
                    <Check className="w-3 h-3 text-emerald-400" />
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Escrow Secured</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
                <button
                  onClick={onExploreBounties}
                  className="px-4 py-1.5 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-[11px] font-bold cursor-pointer transition-all shadow-md"
                >
                  View Bounty
                </button>
              </div>
            </div>

            {/* Card 2: Floating Student Reputation Profile Card */}
            <div className="p-4.5 rounded-2xl bg-[#0F172A] border border-purple-500/30 shadow-xl backdrop-blur-md flex items-center justify-between relative z-30 animate-float-delayed hover:translate-y-0 transition-transform">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-[#8B5CF6] shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Student Reputation</div>
                  <div className="text-[11px] text-slate-200 font-medium">
                    Level 3 Scholar &bull; <strong className="text-white">Completed: 24 Tasks</strong> &bull; <span className="text-emerald-400 font-bold">98% Score</span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 border border-purple-500/30 px-2.5 py-1 rounded-full shrink-0">
                Top Contributor
              </span>
            </div>

            {/* Card 3: Floating Wallet Activity Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg backdrop-blur-md flex items-center justify-between relative z-10 animate-float-fast">
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-200">Wallet Connected: GBUFJT...JBF</span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Reward Received: +5.0 XLM
              </span>
            </div>

            {/* Card 4: Live Activity Notification Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-indigo-500/20 shadow-md backdrop-blur-md flex items-center justify-between relative z-10 text-xs">
              <div className="flex items-center gap-2 text-slate-200 font-medium">
                <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>Student completed <strong className="text-white">React Dashboard Challenge</strong></span>
              </div>
              <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                +5.0 XLM Released
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
