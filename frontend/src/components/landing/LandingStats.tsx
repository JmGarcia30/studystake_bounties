import { Users, CheckCircle2, Coins, Shield } from "lucide-react";

export function LandingStats() {
  const stats = [
    {
      label: "Student Opportunities",
      value: "500+",
      sub: "Active educational tasks",
      icon: <Users className="w-5 h-5 text-[#8B5CF6]" />,
    },
    {
      label: "Completed Bounties",
      value: "120+",
      sub: "Verified task proofs",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    },
    {
      label: "XLM Distributed",
      value: "5,000+",
      sub: "Direct peer rewards",
      icon: <Coins className="w-5 h-5 text-purple-300" />,
    },
    {
      label: "Gateway Fee",
      value: "0.00%",
      sub: "Zero platform commission",
      icon: <Shield className="w-5 h-5 text-indigo-400" />,
    },
  ];

  return (
    <section className="w-full py-12 px-6 border-y border-slate-800/80 bg-[#0F172A]/90 relative z-20">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-[#6C5CE7]/40 transition-all flex items-center gap-4 shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center shrink-0">
              {s.icon}
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">{s.value}</div>
              <div className="text-xs font-extrabold text-slate-100">{s.label}</div>
              <div className="text-[11px] text-slate-300 font-medium">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
