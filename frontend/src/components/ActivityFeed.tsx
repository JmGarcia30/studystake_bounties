import { useEventStream, type ConnectionState } from "../hooks/useEventStream";
import { pruneConfirmed, type OptimisticActivity } from "../lib/optimisticActivity";
import { Radio, RefreshCw, Zap } from "lucide-react";

const STATUS_LABELS: Record<ConnectionState, string> = {
  loading: "Connecting…",
  live: "Live",
  reconnecting: "Reconnecting…",
  error: "Error",
};

interface Props {
  refreshKey: number;
  optimisticItems?: OptimisticActivity[];
}

export function ActivityFeed({ refreshKey, optimisticItems = [] }: Props) {
  const { items, state, error } = useEventStream({ refreshKey });
  const newestFirst = items.slice().reverse();
  const pending = pruneConfirmed(optimisticItems, items);

  return (
    <section className="panel !bg-white !border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <h2 className="text-base font-bold text-slate-900 m-0">Live Activity</h2>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <span
            className={`w-2 h-2 rounded-full ${
              state === "live"
                ? "bg-emerald-500 animate-ping"
                : state === "loading" || state === "reconnecting"
                ? "bg-amber-500 animate-bounce"
                : "bg-rose-500"
            }`}
          ></span>
          <span className={`stream-status stream-status-${state} text-xs font-extrabold uppercase tracking-wider`}>
            {STATUS_LABELS[state]}
          </span>
        </div>
      </div>

      <p className="muted text-xs text-slate-500 mb-3 m-0 font-normal">
        Recent contract activity, polled from testnet events.
      </p>

      {error && <p className="error text-rose-700 text-xs mt-2 m-0 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium">{error}</p>}

      {pending.length === 0 && items.length === 0 && state === "loading" && (
        <div className="flex items-center gap-2 text-slate-600 text-sm py-4">
          <RefreshCw className="w-4 h-4 animate-spin text-[#6C5CE7]" />
          <p className="muted text-xs text-slate-500 m-0">Loading activity…</p>
        </div>
      )}

      {pending.length === 0 && items.length === 0 && state !== "loading" && !error && (
        <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <Zap className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="muted text-xs text-slate-500 m-0 font-normal">No activity yet.</p>
        </div>
      )}

      {pending.length > 0 && (
        <ul className="activity-list space-y-2">
          {pending.map((item) => (
            <li key={item.id} className="activity-local bg-amber-50 border-amber-200 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="local-badge text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-amber-300">
                  Syncing…
                </span>
                <strong className="text-amber-900 font-bold">{item.action}</strong>
                {item.bountyId !== null && <span className="text-slate-800 font-semibold">— bounty #{item.bountyId}</span>}
                <span className="text-slate-600">by <code className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">{item.actor.slice(0, 8)}…</code></span>
              </div>
              {item.amount !== undefined && (
                <span className="font-mono text-emerald-700 text-xs font-bold">({item.amount.toString()} stroops)</span>
              )}
            </li>
          ))}
        </ul>
      )}

      <ul className="activity-list space-y-2">
        {newestFirst.map((item) => (
          <li key={item.id} className="bg-slate-50 border-slate-200/80 p-3 rounded-xl flex items-center justify-between text-xs hover:border-slate-300 transition-all">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                item.action === "created"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : item.action === "accepted"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : item.action === "released"
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "bg-purple-50 text-[#6C5CE7] border border-purple-200"
              }`}>
                {item.action}
              </span>
              <span className="text-slate-900 font-bold">bounty #{item.bountyId}</span>
              <span className="text-slate-600">by <code className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200">{item.actor.slice(0, 8)}…</code></span>
              <span className="text-slate-500 font-mono">({item.amount.toString()} stroops)</span>
            </div>
            <span className="muted text-slate-500 text-[11px]"> · ledger {item.ledger}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
