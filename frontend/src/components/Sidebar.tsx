import { LayoutDashboard, Target, PlusCircle, Award, Radio, GraduationCap, ExternalLink } from "lucide-react";

export type NavTab = "dashboard" | "marketplace" | "escrow" | "reputation" | "events";

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Sidebar({ activeTab, onTabChange }: Props) {
  const navItems: { id: NavTab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "marketplace", label: "Bounty Marketplace", icon: Target },
    { id: "escrow", label: "Sponsor Hub", icon: PlusCircle },
    { id: "reputation", label: "Talent Reputation", icon: Award },
    { id: "events", label: "Live Events", icon: Radio },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 p-5 flex flex-col justify-between hidden md:flex h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Minimal Logo & Brand */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="p-2.5 rounded-xl bg-[#6C5CE7] text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 m-0 tracking-tight leading-tight">
              StudyStake
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C5CE7]">
              Soroban Bounties
            </span>
          </div>
        </div>

        {/* Minimal Navigation Items */}
        <nav className="space-y-1">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Overview
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? "!bg-purple-50 !text-[#6C5CE7] font-bold"
                    : "!bg-transparent !text-slate-600 hover:!text-slate-900 hover:!bg-slate-50 font-medium"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#6C5CE7]" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Widget */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-700 font-semibold">
            <span>Network</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Testnet
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Soroban Smart Contract
          </div>
        </div>

        <a
          href="https://laboratory.stellar.org/#account-creator?network=testnet"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs transition-colors font-medium shadow-xs"
        >
          <span>Friendbot Faucet</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    </aside>
  );
}
