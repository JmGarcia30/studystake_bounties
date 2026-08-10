import { Wallet, UserCheck, Briefcase, Menu, Search, Bell, LogOut } from "lucide-react";
import { useState } from "react";
import type { NavTab } from "./Sidebar";
import type { UserRole } from "../types/user";
import { useAuth } from "../hooks/useAuth";

interface Props {
  address: string | null;
  activeRole: UserRole;
  activeTab: NavTab;
  onRoleChange: (role: UserRole) => void;
  onTabChange: (tab: NavTab) => void;
  onConnected: (address: string) => void;
  onDisconnected: () => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
}

export function Header({
  address,
  activeRole,
  activeTab,
  onRoleChange,
  onTabChange,
  onConnected: _onConnected,
  onDisconnected,
  onOpenNotifications,
  onOpenSettings,
}: Props) {
  const { userProfile, disconnectWallet, connectAndVerifyWallet, loadingStep } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isBusy = loadingStep !== "idle";

  async function handleConnect() {
    try {
      await connectAndVerifyWallet();
    } catch {
      // Handled in auth state
    }
  }

  async function handleDisconnect() {
    await disconnectWallet();
    onDisconnected();
  }

  const tabs: { id: NavTab; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "marketplace", label: "Marketplace" },
    { id: "escrow", label: "Sponsor Hub" },
    { id: "reputation", label: "Reputation" },
    { id: "events", label: "Live Events" },
  ];

  return (
    <header className="w-full border-b border-slate-200 bg-white sticky top-0 z-30 px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Mobile Brand / Toggle */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="StudyStake Icon" className="h-8 w-auto object-contain" />
            <span className="font-bold text-slate-900 text-base">StudyStake</span>
          </div>
        </div>

        {/* Left-Aligned Search Bar */}
        <div className="relative flex-1 max-w-md hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search bounties, tasks, or contract ID..."
            className="w-full bg-slate-50 border border-slate-200 text-xs py-2 pl-10 pr-4 rounded-xl text-slate-900 focus:border-[#6C5CE7] focus:bg-white focus:ring-1 focus:ring-[#6C5CE7] transition-all"
          />
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          {/* User Handle & Profile Badge */}
          {userProfile && (
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition-all text-left"
              title="Click to open settings"
            >
              <div className="w-6 h-6 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center text-[10px] font-bold">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-none">{userProfile.name}</span>
                <span className="text-[10px] text-slate-500 font-mono leading-tight">{userProfile.username}</span>
              </div>
            </button>
          )}

          {/* View Mode Toggle Pill (Switches View Perspective) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => onRoleChange("student")}
              title="View Student Dashboard"
              className={`text-xs py-1 px-2.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeRole === "student"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>

            <button
              type="button"
              onClick={() => onRoleChange("sponsor")}
              title="View Sponsor Hub"
              className={`text-xs py-1 px-2.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                activeRole === "sponsor"
                  ? "bg-[#6C5CE7] text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Sponsor</span>
            </button>
          </div>

          {/* Notifications Icon Button */}
          <button
            type="button"
            onClick={onOpenNotifications}
            className="!p-2 !bg-slate-50 hover:!bg-slate-100 !border-slate-200 text-slate-600 rounded-xl cursor-pointer hidden md:flex"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
          </button>

          {/* User Connect / Address Button */}
          {address ? (
            <button
              onClick={handleDisconnect}
              className="text-xs bg-slate-100 hover:bg-rose-50 text-slate-800 hover:text-rose-600 border-slate-200 hover:border-rose-200 font-semibold py-2 px-3.5 rounded-xl flex items-center gap-1.5 transition-all"
              title="Click to disconnect wallet"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>{address.slice(0, 6)}…{address.slice(-4)}</span>
              <LogOut className="w-3 h-3 ml-1 text-slate-400 hover:text-rose-600" />
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isBusy}
              className="text-xs bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white border-purple-400/30 shadow-xs font-semibold py-2 px-3.5 rounded-xl flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              {isBusy ? "Connecting…" : "Connect"}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden pt-3 mt-3 border-t border-slate-200 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onTabChange(t.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left text-xs py-2 px-3 rounded-lg font-bold ${
                activeTab === t.id
                  ? "bg-[#6C5CE7] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
