import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Wallet,
  Coins,
  Award,
  Vault,
  TrendingUp,
  RefreshCw,
  Database,
  Search,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  fetchEcosystemData,
  formatShortAddress,
  formatRelativeTime,
} from "../../services/walletEcosystemService";
import type {
  EcosystemUser,
  EcosystemTransaction,
  EcosystemStats,
} from "../../types/walletEcosystem";

export function MockWalletDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState<EcosystemUser[]>([]);
  const [transactions, setTransactions] = useState<EcosystemTransaction[]>([]);
  const [stats, setStats] = useState<EcosystemStats | null>(null);
  const [isLive, setIsLive] = useState(false);

  const [roleFilter, setRoleFilter] = useState<"All" | "student" | "sponsor">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [txTypeFilter, setTxTypeFilter] = useState<string>("All");

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchEcosystemData();
      setUsers(data.users);
      setTransactions(data.transactions);
      setStats(data.stats);
      setIsLive(data.isSupabaseLive);
    } catch (err) {
      console.error("Failed to load ecosystem dashboard data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.walletAddress.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredTransactions = transactions.filter((tx) => {
    if (txTypeFilter === "All") return true;
    return tx.type === txTypeFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full space-y-4">
        <RefreshCw className="w-8 h-8 text-[#6C5CE7] animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading Supabase Wallet Ecosystem Data...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#6C5CE7]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                {isLive ? "Source: Supabase DB" : "Source: Supabase DB (Seeded Demo Mode)"}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
                Stellar Testnet Ecosystem
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white m-0">
              Wallet Ecosystem &amp; Micro-bounty Activity
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Real-time analytics and user directory for 15+ student scholars and project sponsors actively participating in Soroban escrow bounties.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* 6 Key Analytics Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 w-full">
          {/* Card 1: Total Users */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Users</span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-purple-50 text-[#6C5CE7]">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{stats.totalUsers}</div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-0.5 truncate">10 Students • 5 Sponsors</div>
          </div>

          {/* Card 2: Connected Wallets */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Wallets</span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{stats.connectedWalletsCount}</div>
            <div className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-0.5 truncate">100% Unique</div>
          </div>

          {/* Card 3: XLM Volume */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Volume</span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Coins className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-2 truncate">{stats.totalXlmVolume.toLocaleString()} XLM</div>
            <div className="text-[10px] sm:text-[11px] text-indigo-600 font-bold mt-0.5 truncate">Cumulative activity</div>
          </div>

          {/* Card 4: Total Rewards */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Rewards</span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-amber-50 text-amber-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-2 truncate">{stats.totalRewardsDistributed.toLocaleString()} XLM</div>
            <div className="text-[10px] sm:text-[11px] text-amber-600 font-bold mt-0.5 truncate">Earned by scholars</div>
          </div>

          {/* Card 5: Total Funded */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Funded</span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-blue-50 text-blue-600">
                <Vault className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-2 truncate">{stats.totalFunded.toLocaleString()} XLM</div>
            <div className="text-[10px] sm:text-[11px] text-blue-600 font-bold mt-0.5 truncate">Locked in escrow</div>
          </div>

          {/* Card 6: Total Interactions */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200/80 hover:-translate-y-1 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Interactions</span>
              <div className="p-1.5 sm:p-2 rounded-xl bg-pink-50 text-pink-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2">{stats.totalInteractionsCount}</div>
            <div className="text-[10px] sm:text-[11px] text-pink-600 font-bold mt-0.5 truncate">75–150 DB logs</div>
          </div>
        </div>
      )}

      {/* Main Grid: User Directory & Provider Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: User Directory Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Ecosystem User Directory</h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Displaying 15 persistent StudyStake student scholars &amp; sponsors from Supabase
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search user or wallet..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#6C5CE7] w-full sm:w-44"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e: any) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#6C5CE7]"
              >
                <option value="All">All Roles</option>
                <option value="student">Students (10)</option>
                <option value="sponsor">Sponsors (5)</option>
              </select>
            </div>
          </div>

          {/* Mobile User Card View */}
          <div className="block md:hidden divide-y divide-slate-100 p-3 space-y-2">
            {filteredUsers.map((user) => {
              const isStudent = user.role === "student";
              return (
                <div key={user.id} className="p-3 bg-slate-50/70 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isStudent ? "bg-purple-100 text-[#6C5CE7]" : "bg-blue-100 text-blue-700"}`}>
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{user.name}</div>
                        <div className="text-[10px] text-slate-400">@{user.username}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isStudent ? "bg-purple-50 text-[#6C5CE7] border border-purple-200/60" : "bg-blue-50 text-blue-700 border border-blue-200/60"}`}>
                      {user.role.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 text-slate-600">
                    <span className="font-mono text-[11px] text-slate-500">{formatShortAddress(user.walletAddress)}</span>
                    <span className="font-bold text-slate-900">{user.balanceXlm.toFixed(2)} XLM</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Wallet Address</th>
                  <th className="px-4 py-3.5 text-right">Balance</th>
                  <th className="px-4 py-3.5 text-center">Activity</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map((user) => {
                  const isStudent = user.role === "student";
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              isStudent ? "bg-purple-100 text-[#6C5CE7]" : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{user.name}</div>
                            <div className="text-[10px] text-slate-400">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isStudent
                              ? "bg-purple-50 text-[#6C5CE7] border border-purple-200/60"
                              : "bg-blue-50 text-blue-700 border border-blue-200/60"
                          }`}
                        >
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-[11px] text-slate-600">
                        <span title={user.walletAddress} className="cursor-help">
                          {formatShortAddress(user.walletAddress)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">
                        {user.balanceXlm.toFixed(2)} XLM
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {user.transactionCount} txs
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Col: Wallet Provider Distribution & System Info */}
        <div className="space-y-6">
          {/* Provider Breakdown Box */}
          <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 m-0">Wallet Provider Distribution</h2>
              <p className="text-xs text-slate-500 m-0 mt-0.5">
                Stellar Wallet Kit authentications in database
              </p>
            </div>

            {stats && (
              <div className="space-y-3 pt-2">
                {stats.providerBreakdown.map((item) => (
                  <div key={item.provider} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{item.provider}</span>
                      <span className="text-slate-500">
                        {item.count} logs ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#6C5CE7] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(item.percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* System Architecture Info Box */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 border border-purple-100 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#6C5CE7] font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Real Stellar Wallet Isolation</span>
            </div>
            <p className="text-slate-600 leading-relaxed m-0">
              The StudyStake Wallet Ecosystem uses synthetic 56-character Stellar public keys stored in Supabase for demonstration purposes.
            </p>
            <div className="pt-2 border-t border-purple-100/80 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Stellar Testnet Wallets</span>
              <span className="font-bold text-[#6C5CE7]">Freighter / Albedo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Activity Stream */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 m-0">
              Wallet Interaction Stream ({transactions.length} Records)
            </h2>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Live database activity feed from <code className="text-[#6C5CE7]">public.wallet_interactions</code>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={txTypeFilter}
              onChange={(e) => setTxTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:border-[#6C5CE7]"
            >
              <option value="All">All Interaction Types</option>
              <option value="reward_released">Reward Released</option>
              <option value="escrow_created">Escrow Created</option>
              <option value="bounty_accepted">Bounty Accepted</option>
              <option value="proof_submitted">Proof Submitted</option>
              <option value="xlm_payment_sent">XLM Payment Sent</option>
              <option value="wallet_connected">Wallet Connected</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTransactions.slice(0, 25).map((tx) => {
            const isReward = tx.type === "reward_released";
            const isEscrow = tx.type === "escrow_created";
            const isPayment = tx.type === "xlm_payment_sent";

            return (
              <div key={tx.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-all">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isReward
                        ? "bg-emerald-50 text-emerald-600"
                        : isEscrow
                        ? "bg-purple-50 text-[#6C5CE7]"
                        : isPayment
                        ? "bg-amber-50 text-amber-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isReward ? (
                      <Award className="w-4 h-4" />
                    ) : isEscrow ? (
                      <Vault className="w-4 h-4" />
                    ) : isPayment ? (
                      <Coins className="w-4 h-4" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{tx.userName}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {formatShortAddress(tx.walletAddress)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isReward
                            ? "bg-emerald-100 text-emerald-700"
                            : isEscrow
                            ? "bg-purple-100 text-[#6C5CE7]"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {tx.type.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 m-0 mt-0.5 font-normal">{tx.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto text-right">
                  {tx.amount > 0 && (
                    <div
                      className={`font-black text-xs ${
                        isReward || isPayment ? "text-emerald-600" : "text-[#6C5CE7]"
                      }`}
                    >
                      {isReward ? "+" : ""}{tx.amount} XLM
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400">
                    <div>{formatRelativeTime(tx.createdAt)}</div>
                    {tx.transactionHash && (
                      <div className="font-mono text-[10px] text-slate-400 flex items-center justify-end gap-1" title="Synthetic Hash">
                        <span>{tx.transactionHash.slice(0, 8)}...</span>
                        <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
