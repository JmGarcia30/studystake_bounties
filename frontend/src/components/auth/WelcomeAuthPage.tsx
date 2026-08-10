import { Wallet, ShieldCheck, Zap, Award, ArrowRight, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

interface Props {
  onReturnToLanding?: () => void;
}

export function WelcomeAuthPage({ onReturnToLanding }: Props) {
  const { connectAndVerifyWallet, loadingStep, authError, clearError } = useAuth();

  const isBusy = loadingStep !== "idle";

  const getLoadingLabel = () => {
    switch (loadingStep) {
      case "connecting":
        return "Connecting Stellar Wallet…";
      case "signing":
        return "Requesting Signature Verification…";
      case "verifying":
        return "Verifying Signature on Testnet…";
      case "loading_profile":
        return "Loading Profile Data…";
      default:
        return "Processing…";
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-slate-100 flex flex-col justify-between selection:bg-[#6C5CE7] selection:text-white font-sans relative overflow-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#6C5CE7]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Brand Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-indigo-400 flex items-center justify-center shadow-lg shadow-[#6C5CE7]/30">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">StudyStake</span>
        </div>

        <div className="flex items-center gap-3">
          {onReturnToLanding && (
            <button
              onClick={onReturnToLanding}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Public Site</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Stellar Soroban Testnet
          </div>
        </div>
      </header>

      {/* Hero Body */}
      <main className="w-full max-w-5xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center z-10">
        {/* Badge Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
          <ShieldCheck className="w-4 h-4 text-[#6C5CE7]" />
          Web3-Native Educational Micro-Bounties
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight max-w-3xl leading-[1.15] mb-6">
          Fund Learning. <br />
          <span className="bg-gradient-to-r from-indigo-300 via-[#6C5CE7] to-purple-400 bg-clip-text text-transparent">
            Stake Educational Proof.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed mb-10">
          StudyStake connects scholars and sponsors through automated Soroban smart contracts. Connect your Stellar wallet to discover micro-bounties, stake learning tasks, and build verified reputation on-chain.
        </p>

        {/* Error Alert if any */}
        {authError && (
          <div className="w-full max-w-md mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button
              onClick={clearError}
              className="text-slate-400 hover:text-white font-bold underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Primary CTA Button */}
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
          <button
            onClick={connectAndVerifyWallet}
            disabled={isBusy}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-indigo-600 hover:from-[#5B4BD6] hover:to-indigo-500 text-white font-bold text-base tracking-wide shadow-xl shadow-[#6C5CE7]/30 border border-purple-400/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{getLoadingLabel()}</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect Stellar Wallet</span>
                <ArrowRight className="w-4 h-4 ml-1 opacity-70" />
              </>
            )}
          </button>

          <p className="text-xs text-slate-500 font-medium">
            Requires Freighter, Albedo, Hana, or any Stellar Testnet wallet.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[#6C5CE7] mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Micro-Bounties</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete modular study tasks, submit verified proofs, and earn instant XLM payout allocations.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Soroban Smart Escrow</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Funds stay locked safely in trustless smart contracts until milestone proofs pass verification.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition-all backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Talent Reputation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Build an immutable, on-chain educational history and showcase verified skill badges to sponsors.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-600 border-t border-slate-800/80 z-10">
        <p>StudyStake &mdash; Powered by Stellar Soroban Smart Contracts</p>
      </footer>
    </div>
  );
}
