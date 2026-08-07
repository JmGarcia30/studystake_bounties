import { useState } from "react";
import { Search, ShieldCheck, Tag, Clock } from "lucide-react";

export interface BountySample {
  id: number;
  title: string;
  category: "Soroban Smart Contracts" | "Web3 Development" | "STEM & Peer Tutoring" | "Data & Algorithms";
  rewardXlm: string;
  sponsor: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  status: "Open" | "In Progress" | "Completed";
}

const SAMPLE_BOUNTIES: BountySample[] = [
  {
    id: 1,
    title: "Rust Soroban Contract Escrow Logic Bugfix",
    category: "Soroban Smart Contracts",
    rewardXlm: "5.0",
    sponsor: "StudyStake Labs",
    description: "Review soroban contract event emissions and optimize storage map gas consumption for peer payouts.",
    difficulty: "Intermediate",
    status: "Open",
  },
  {
    id: 2,
    title: "Linear Algebra & Eigenvector Proof Peer Session",
    category: "STEM & Peer Tutoring",
    rewardXlm: "2.5",
    sponsor: "Campus Peer Hub",
    description: "Conduct a 45-minute peer tutoring session explaining matrix diagonalization and linear transformations.",
    difficulty: "Beginner",
    status: "Open",
  },
  {
    id: 3,
    title: "React & Tailwind CSS dApp Responsive Dashboard",
    category: "Web3 Development",
    rewardXlm: "10.0",
    sponsor: "Stellar Builders",
    description: "Implement responsive dashboard layouts and wallet connection indicators using Tailwind CSS.",
    difficulty: "Advanced",
    status: "Open",
  },
  {
    id: 4,
    title: "Binary Search Tree Time Complexity Code Review",
    category: "Data & Algorithms",
    rewardXlm: "1.5",
    sponsor: "CS Tutoring Circle",
    description: "Provide detailed feedback on BST rebalancing algorithms and Big-O memory bounds.",
    difficulty: "Beginner",
    status: "Open",
  },
];

interface Props {
  onSelectBountyPreset: (amount: string, bountyId?: number) => void;
  activeRole: "student" | "employer";
}

export function BountyMarketplace({ onSelectBountyPreset, activeRole }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["All", "Soroban Smart Contracts", "Web3 Development", "STEM & Peer Tutoring", "Data & Algorithms"];

  const filtered = SAMPLE_BOUNTIES.filter((b) => {
    const matchesCat = selectedCategory === "All" || b.category === selectedCategory;
    const matchesQuery =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <section className="panel !bg-white !border-slate-200/80 shadow-xs space-y-6 w-full">
      {/* Header & Filter Pills */}
      <div className="space-y-4 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-lg font-bold text-slate-900 m-0">
              {activeRole === "student" ? "Talent Bounty Marketplace" : "Sponsor Challenge Board"}
            </h2>
            <p className="muted text-xs text-slate-500 m-0 mt-0.5">
              {activeRole === "student"
                ? "Browse micro-challenges, earn XLM, and record verified career proof."
                : "Post challenges, set crypto rewards, and discover student talent."}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
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

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`!text-xs !py-1.5 !px-3.5 rounded-xl transition-all whitespace-nowrap cursor-pointer font-semibold ${
                selectedCategory === cat
                  ? "!bg-[#6C5CE7] !text-white !border-[#6C5CE7] shadow-xs"
                  : "!bg-slate-100 !text-slate-700 hover:!bg-slate-200 !border-slate-200/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Bounty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((bounty) => (
          <div
            key={bounty.id}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-purple-50 text-[#6C5CE7] border border-purple-100">
                  {bounty.category}
                </span>
                <span className="text-xs font-mono font-extrabold text-[#6C5CE7] bg-purple-50 border border-purple-100 px-2.5 py-0.5 rounded-lg">
                  {bounty.rewardXlm} XLM
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 m-0 border-0 p-0 mb-1 leading-snug">
                {bounty.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed m-0 mb-3 font-normal line-clamp-2">
                {bounty.description}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Sponsor: <strong className="text-slate-900">{bounty.sponsor}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  {bounty.difficulty}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Status: <span className="text-emerald-600 font-bold">{bounty.status}</span>
              </span>

              <button
                type="button"
                onClick={() => onSelectBountyPreset(bounty.rewardXlm, bounty.id)}
                className="!text-xs !py-1.5 !px-3.5 !bg-[#6C5CE7] hover:!bg-[#5B4BD6] !text-white !border-[#6C5CE7] shadow-xs font-bold rounded-xl cursor-pointer"
              >
                {activeRole === "student" ? "Stake to Claim" : "Fund Reward"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
