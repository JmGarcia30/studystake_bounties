import { useState, useEffect } from "react";
import { Search, Tag, ShieldCheck, X, ArrowRight, Coins, Lock } from "lucide-react";
import type { Bounty } from "../../types/bounty";
import { fetchBounties } from "../../services/bountyService";

interface Props {
  onConnectWallet: () => void;
}

export function PublicBountyPreview({ onConnectWallet }: Props) {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activePreviewBounty, setActivePreviewBounty] = useState<Bounty | null>(null);

  const filters = ["All", "Development", "Design", "Tutoring", "Writing", "Research"];

  useEffect(() => {
    setIsLoading(true);
    fetchBounties("All", searchQuery)
      .then((items) => {
        const filtered = items.filter((b) => {
          if (selectedFilter === "All") return true;
          if (selectedFilter === "Development") {
            return (
              b.category === "Soroban Smart Contracts" ||
              b.category === "Web3 Development" ||
              b.category === "Data & Algorithms"
            );
          }
          if (selectedFilter === "Tutoring") {
            return b.category === "STEM & Peer Tutoring";
          }
          return true;
        });
        setBounties(filtered);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [selectedFilter, searchQuery]);

  return (
    <section id="bounties" className="w-full py-20 lg:py-28 px-6 border-t border-slate-800/80 bg-[#0B1120] relative">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[#8B5CF6] text-xs font-bold uppercase tracking-wider">
              Live Bounty Board Preview
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight m-0">
              Explore Active Bounties
            </h2>
            <p className="text-base text-slate-200 max-w-xl m-0 font-medium">
              Preview educational micro-bounties available for scholars. Connect your Stellar wallet to claim bounties or lock new escrows.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-300 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search bounties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#6C5CE7] transition-all font-medium"
            />
          </div>
        </div>

        {/* Lightweight Filter Pills */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setSelectedFilter(f)}
              className={`text-xs py-2.5 px-5 rounded-2xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedFilter === f
                  ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/30"
                  : "bg-slate-900 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-600"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Bounty Cards Grid */}
        {isLoading ? (
          <div className="py-16 text-center text-slate-300 text-xs font-semibold">
            Loading preview bounties…
          </div>
        ) : bounties.length === 0 ? (
          <div className="py-16 text-center text-slate-300 text-xs font-medium">
            No matching bounties found for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bounties.map((b) => (
              <div
                key={b.id}
                onClick={() => setActivePreviewBounty(b)}
                className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-[#6C5CE7]/50 shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group flex flex-col justify-between space-y-5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {b.category}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-[#6C5CE7] bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-xl flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-[#6C5CE7]" />
                      {b.rewardXlm} XLM
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-200 transition-colors mb-2">
                    {b.title}
                  </h3>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium line-clamp-2 mb-4">
                    {b.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-200 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      Sponsor: <strong className="text-white font-bold">{b.sponsor}</strong>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      {b.difficulty}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Status: <span className="text-emerald-400 font-bold">Escrow Secured</span>
                  </span>

                  <span className="text-[#8B5CF6] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Read-Only Detail Modal */}
      {activePreviewBounty && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative shadow-2xl animate-fade-in">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  {activePreviewBounty.category}
                </span>
                <h3 className="text-lg font-bold text-white mt-2 m-0">{activePreviewBounty.title}</h3>
              </div>
              <button
                onClick={() => setActivePreviewBounty(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-200 font-medium">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Bounty Overview</label>
                <p className="leading-relaxed text-slate-200 bg-slate-950/80 p-4 rounded-2xl border border-slate-800 m-0">
                  {activePreviewBounty.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="block text-slate-300 text-[11px] font-semibold mb-0.5">Reward Allocation</span>
                  <span className="text-base font-extrabold text-[#8B5CF6]">{activePreviewBounty.rewardXlm} XLM</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <span className="block text-slate-300 text-[11px] font-semibold mb-0.5">Verified Sponsor</span>
                  <span className="text-xs font-bold text-white">{activePreviewBounty.sponsor}</span>
                </div>
              </div>
            </div>

            {/* Read-Only Prompt */}
            <div className="pt-2 border-t border-slate-800 flex flex-col gap-3">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-xs text-center font-semibold">
                Connect your Stellar Wallet to claim this bounty or submit proof.
              </div>
              <button
                onClick={() => {
                  setActivePreviewBounty(null);
                  onConnectWallet();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] hover:from-[#5B4BD6] hover:to-[#7C3AED] text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Connect Wallet to Claim Bounty</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
