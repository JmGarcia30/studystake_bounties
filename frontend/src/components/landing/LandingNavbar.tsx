import { useState } from "react";
import { Wallet, Menu, X, ArrowRight } from "lucide-react";

interface Props {
  onConnectWallet: () => void;
  onLaunchApp: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export function LandingNavbar({ onConnectWallet, onLaunchApp, onScrollToSection }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    onScrollToSection(sectionId);
    setMobileOpen(false);
  };

  return (
    <header className="w-full bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Prominent Logo & Brand Header */}
        <div
          onClick={() => handleNavClick("hero")}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src="/logo-icon.png"
            alt="StudyStake Icon"
            className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-all drop-shadow-md"
          />
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-white leading-none">StudyStake</span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-tight mt-0.5">Talent Mobility</span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-200">
          <button
            onClick={() => handleNavClick("features")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick("how-it-works")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => handleNavClick("bounties")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Bounties
          </button>
          <button
            onClick={() => handleNavClick("benefits")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Benefits
          </button>
        </nav>

        {/* Header Right Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onConnectWallet}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-indigo-400" />
            <span>Connect Wallet</span>
          </button>

          <button
            onClick={onLaunchApp}
            className="px-4 py-2 rounded-xl bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white text-xs font-bold shadow-lg shadow-[#6C5CE7]/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch App</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0F172A] px-6 py-4 space-y-4 animate-fade-in">
          <div className="flex flex-col space-y-3 text-sm font-semibold text-slate-200">
            <button
              onClick={() => handleNavClick("features")}
              className="text-left py-1 hover:text-white"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick("how-it-works")}
              className="text-left py-1 hover:text-white"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick("bounties")}
              className="text-left py-1 hover:text-white"
            >
              Bounties
            </button>
            <button
              onClick={() => handleNavClick("benefits")}
              className="text-left py-1 hover:text-white"
            >
              Benefits
            </button>
          </div>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileOpen(false);
                onConnectWallet();
              }}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4 text-indigo-400" />
              <span>Connect Wallet</span>
            </button>

            <button
              onClick={() => {
                setMobileOpen(false);
                onLaunchApp();
              }}
              className="w-full py-2.5 rounded-xl bg-[#6C5CE7] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2"
            >
              <span>Launch App</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
