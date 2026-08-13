import { useState, useEffect, useCallback } from "react";
import { Search, Tag, Clock, Send, FileCheck, Sparkles, Coins, Lock, Code2, AlertCircle } from "lucide-react";
import type { UserRole } from "../types/user";
import type { Bounty, BountyCategory, ProofSubmission } from "../types/bounty";
import { fetchBounties, fetchContributorSubmissions } from "../services/bountyService";
import { SubmitProofModal } from "./dashboard/SubmitProofModal";
import { SkeletonCard } from "./common/SkeletonCard";
import { useAuth } from "../hooks/useAuth";

interface Props {
  onSelectBountyPreset: (amount: string, bountyId?: number) => void;
  activeRole: UserRole;
}

export function BountyMarketplace({ onSelectBountyPreset, activeRole }: Props) {
  const { walletAddress } = useAuth();

  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [submissions, setSubmissions] = useState<ProofSubmission[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BountyCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "recommended" | "submissions">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeBountyForProof, setActiveBountyForProof] = useState<Bounty | null>(null);

  const categories: Array<BountyCategory | "All"> = [
    "All",
    "Soroban Smart Contracts",
    "Web3 Development",
    "STEM & Peer Tutoring",
    "Data & Algorithms",
  ];

  const getSkillsForBounty = (category: string) => {
    switch (category) {
      case "Soroban Smart Contracts":
        return ["Rust", "Soroban", "Stellar SDK"];
      case "Web3 Development":
        return ["React", "Tailwind", "TypeScript"];
      case "STEM & Peer Tutoring":
        return ["Calculus", "Physics", "Python"];
      default:
        return ["JavaScript", "React", "Web3"];
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const items = await fetchBounties(selectedCategory, searchQuery);
      setBounties(items);
      if (walletAddress) {
        const subs = await fetchContributorSubmissions(walletAddress);
        setSubmissions(subs);
      } else {
        setSubmissions([]);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Bounty data could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, walletAddress]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const displayedBounties = activeTab === "recommended"
    ? bounties.slice(0, 2)
    : bounties;

  return (
    <section className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 w-full font-sans">

      {/* Recommendation System Highlight Banner */}
      {activeRole === "student" && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-slate-900/5 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6C5CE7] text-white flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 m-0">Recommended Opportunities for You</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold border border-emerald-300">
                  92% Match
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium m-0 mt-0.5">
                Based on your profile skills: <strong className="text-slate-900">React, Tailwind CSS, TypeScript &amp; Soroban</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === "recommended" ? "all" : "recommended")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "recommended"
                  ? "bg-[#6C5CE7] text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {activeTab === "recommended" ? "Showing Recommended" : "Filter Recommended"}
            </button>
          </div>
        </div>
      )}

      {/* Header & Filter Controls */}
      <div className="space-y-4 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-black text-slate-900 m-0 tracking-tight">
              {activeRole === "student" ? "Talent Bounty Marketplace" : "Sponsor Challenge Board"}
            </h2>
            <p className="text-xs text-slate-500 m-0 mt-0.5 font-medium">
              {activeRole === "student"
                ? "Browse micro-challenges, submit proof of work, claim XLM rewards, and record career proof."
                : "Post challenges, fund crypto rewards, and discover student talent."}
            </p>
          </div>

          {/* Navigation Tab Toggle & Search */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeRole === "student" && (
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeTab === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Bounties
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("submissions")}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    activeTab === "submissions" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  My Submissions ({submissions.length})
                </button>
              </div>
            )}

            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search bounties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-slate-200 text-xs py-2 pl-9 pr-3 rounded-xl text-slate-900 focus:border-[#6C5CE7] focus:ring-1 focus:ring-[#6C5CE7]"
              />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        {activeTab !== "submissions" && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs py-1.5 px-3.5 rounded-xl transition-all whitespace-nowrap cursor-pointer font-bold ${
                  selectedCategory === cat
                    ? "bg-[#6C5CE7] text-white border-[#6C5CE7] shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <SkeletonCard count={4} />
      ) : loadError ? (
        <div role="alert" className="py-10 text-center text-rose-700 space-y-3 rounded-2xl bg-rose-50 border border-rose-200">
          <AlertCircle className="w-7 h-7 mx-auto" />
          <p className="text-xs font-semibold m-0">{loadError}</p>
          <button type="button" onClick={loadData} className="text-xs font-bold underline">Try again</button>
        </div>
      ) : activeTab === "submissions" ? (
        /* My Submissions Tab View */
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileCheck className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs font-semibold">No proof submissions submitted yet.</p>
              <button
                onClick={() => setActiveTab("all")}
                className="text-xs text-[#6C5CE7] font-bold underline cursor-pointer"
              >
                Browse open micro-bounties
              </button>
            </div>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Bounty #{sub.bountyId} Submission</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] border border-amber-200">
                    {sub.reviewStatus}
                  </span>
                </div>
                <p className="text-slate-600 font-mono break-all m-0">{sub.proofUrl}</p>
                {sub.notes && <p className="text-slate-500 italic m-0">{sub.notes}</p>}
                <div className="text-[10px] text-slate-400 pt-1">
                  Submitted: {new Date(sub.submittedAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Rich Bounty Opportunity Cards Grid */
        displayedBounties.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs font-semibold">
            No bounties match the selected filters.
          </div>
        ) : <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedBounties.map((bounty) => {
            const skills = getSkillsForBounty(bounty.category);
            return (
              <div
                key={bounty.id}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-[#6C5CE7]/60 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  {/* Top Metadata Header */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-50 text-[#6C5CE7] border border-purple-100">
                      {bounty.category}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-[#6C5CE7] bg-purple-50 border border-purple-100 px-3 py-1 rounded-xl flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-[#6C5CE7]" />
                      +{bounty.rewardXlm} XLM
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 m-0 p-0 mb-1.5 leading-snug group-hover:text-[#6C5CE7] transition-colors">
                      {bounty.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed m-0 font-normal line-clamp-2">
                      {bounty.description}
                    </p>
                  </div>

                  {/* Required Skill Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                      <Code2 className="w-3 h-3 text-slate-400" />
                      Skills:
                    </span>
                    {skills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Sponsor & Time Metadata */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400" />
                      Sponsor: <strong className="text-slate-900 font-bold">{bounty.creator.displayName}</strong>
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      ~2 hours &bull; {bounty.difficulty}
                    </span>
                  </div>
                </div>

                {/* Footer Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Escrow Secured</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeRole === "student" ? (
                      <button
                        type="button"
                        onClick={() => setActiveBountyForProof(bounty)}
                        className="text-xs py-2 px-4 bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white shadow-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Proof</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectBountyPreset(bounty.rewardXlm, bounty.id)}
                        className="text-xs py-2 px-4 bg-[#6C5CE7] hover:bg-[#5B4BD6] text-white shadow-xs font-bold rounded-xl cursor-pointer transition-all"
                      >
                        Fund Escrow
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Proof Submission Modal */}
      {activeBountyForProof && (
        <SubmitProofModal
          bounty={activeBountyForProof}
          onClose={() => setActiveBountyForProof(null)}
          onSuccess={loadData}
        />
      )}
    </section>
  );
}
