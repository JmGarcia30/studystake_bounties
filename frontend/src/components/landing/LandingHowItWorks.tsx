import { useState } from "react";
import { Wallet, Search, Send, Coins, PlusCircle, Lock, Eye, Award } from "lucide-react";

export function LandingHowItWorks() {
  const [activeTab, setActiveTab] = useState<"student" | "sponsor">("student");

  const studentSteps = [
    {
      step: "01",
      title: "Connect Wallet",
      desc: "Link your Freighter or Stellar wallet with 1-click signature verification.",
      icon: <Wallet className="w-5 h-5 text-[#8B5CF6]" />,
    },
    {
      step: "02",
      title: "Discover Bounties",
      desc: "Browse educational micro-tasks matching your skills and interests.",
      icon: <Search className="w-5 h-5 text-indigo-400" />,
    },
    {
      step: "03",
      title: "Complete & Submit",
      desc: "Solve the study challenge and submit your solution proof link for review.",
      icon: <Send className="w-5 h-5 text-purple-300" />,
    },
    {
      step: "04",
      title: "Earn Rewards",
      desc: "Smart escrow releases XLM directly to your wallet and updates your reputation.",
      icon: <Coins className="w-5 h-5 text-emerald-400" />,
    },
  ];

  const sponsorSteps = [
    {
      step: "01",
      title: "Create Bounty",
      desc: "Define the study task parameters and XLM bounty reward amount.",
      icon: <PlusCircle className="w-5 h-5 text-[#8B5CF6]" />,
    },
    {
      step: "02",
      title: "Lock Escrow",
      desc: "Deposit XLM reward funds safely into a Soroban smart contract vault.",
      icon: <Lock className="w-5 h-5 text-indigo-400" />,
    },
    {
      step: "03",
      title: "Review Work",
      desc: "Inspect submitted code links and solution notes from students.",
      icon: <Eye className="w-5 h-5 text-purple-300" />,
    },
    {
      step: "04",
      title: "Release Payment",
      desc: "Approve milestone completion to disburse XLM directly to the scholar.",
      icon: <Award className="w-5 h-5 text-emerald-400" />,
    },
  ];

  const currentSteps = activeTab === "student" ? studentSteps : sponsorSteps;

  return (
    <section id="how-it-works" className="w-full py-20 lg:py-28 px-6 border-t border-slate-800/80 bg-[#0F172A]">
      <div className="max-w-6xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-black text-white !text-white tracking-tight">
            How StudyStake Works
          </h2>
          <p className="text-base text-slate-200 !text-slate-200 font-medium">
            A simple, transparent 4-step process engineered for students and sponsors.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab("student")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "student"
                  ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/30"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Student Flow
            </button>
            <button
              onClick={() => setActiveTab("sponsor")}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "sponsor"
                  ? "bg-[#6C5CE7] text-white shadow-lg shadow-[#6C5CE7]/30"
                  : "text-slate-200 hover:text-white"
              }`}
            >
              Sponsor Flow
            </button>
          </div>
        </div>

        {/* Fixed 4-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentSteps.map((s) => (
            <div
              key={s.step}
              className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 hover:border-[#6C5CE7]/50 shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700/80 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {s.icon}
                  </div>
                  <span className="text-xl font-black text-[#8B5CF6] font-mono">{s.step}</span>
                </div>
                <h3 className="text-lg font-bold text-white !text-white group-hover:text-indigo-200 transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-200 !text-slate-200 leading-relaxed font-normal">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
