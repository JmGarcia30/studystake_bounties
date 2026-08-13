import { LayoutDashboard, Target, PlusCircle, Award, Radio, ExternalLink, ClipboardCheck } from "lucide-react";

export type NavTab = "dashboard" | "marketplace" | "escrow" | "reputation" | "events" | "evidence";

interface Props {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export function Sidebar({ activeTab, onTabChange }: Props) {
  const navItems: { id: NavTab; label: string; icon: typeof LayoutDashboard; badge?: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "marketplace", label: "Opportunities", icon: Target, badge: "12" },
    { id: "escrow", label: "Sponsor Hub", icon: PlusCircle },
    { id: "reputation", label: "Reputation", icon: Award },
    { id: "events", label: "Activity & Events", icon: Radio },
    { id: "evidence", label: "Level 4 Evidence", icon: ClipboardCheck },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 p-5 flex flex-col justify-between hidden md:flex h-full overflow-y-auto font-sans">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1 pt-1">
          <img src="/logo-icon.png" alt="StudyStake Icon" className="h-10 w-auto object-contain shadow-xs rounded-lg" />
          <div>
            <h1 className="text-base font-black text-slate-900 m-0 tracking-tight leading-tight">
              StudyStake
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C5CE7]">
              Talent Command Center
            </span>
          </div>
        </div>

        {/* Product Navigation Items */}
        <nav className="space-y-1.5">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isActive
                    ? "!bg-purple-50 !text-[#6C5CE7] font-bold shadow-xs border-l-4 border-[#6C5CE7]"
                    : "!bg-transparent !text-slate-600 hover:!text-slate-900 hover:!bg-slate-50 font-medium"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#6C5CE7]" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? "bg-[#6C5CE7] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Status Widget */}
      <div className="space-y-2.5 pt-4 border-t border-slate-100">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-700 font-semibold">
            <span>Stellar Network</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1.5 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Testnet
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Soroban Escrow Protocol
          </div>
        </div>

        <a
          href="https://laboratory.stellar.org/#account-creator?network=testnet"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs transition-all font-medium shadow-xs"
        >
          <span>Friendbot Faucet</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>
    </aside>
  );
}
