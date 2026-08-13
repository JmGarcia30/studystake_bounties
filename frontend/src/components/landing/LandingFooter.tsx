interface Props {
  onScrollToSection: (sectionId: string) => void;
}

export function LandingFooter({ onScrollToSection }: Props) {
  return (
    <footer className="w-full bg-[#090D16] border-t border-slate-800/80 py-12 px-6 font-sans text-slate-400">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        {/* Logo Branding */}
        <div className="flex items-center gap-3">
          <img src="/logo-icon.png" alt="StudyStake Icon" className="h-8 w-auto object-contain" />
          <span className="text-sm font-bold text-white tracking-tight">StudyStake</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-6 font-medium text-slate-300">
          <button onClick={() => onScrollToSection("features")} className="hover:text-white transition-colors cursor-pointer">
            Features
          </button>
          <button onClick={() => onScrollToSection("how-it-works")} className="hover:text-white transition-colors cursor-pointer">
            How It Works
          </button>
          <button onClick={() => onScrollToSection("bounties")} className="hover:text-white transition-colors cursor-pointer">
            Bounties
          </button>
          <button onClick={() => onScrollToSection("benefits")} className="hover:text-white transition-colors cursor-pointer">
            Benefits
          </button>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} StudyStake &mdash; Powered by Stellar Soroban Smart Contracts
        </div>
      </div>
    </footer>
  );
}
