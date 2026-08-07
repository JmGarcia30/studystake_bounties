import { useEventStream, type ConnectionState } from "../hooks/useEventStream";
import { pruneConfirmed, type OptimisticActivity } from "../lib/optimisticActivity";

const STATUS_LABELS: Record<ConnectionState, string> = {
  loading: "Connecting…",
  live: "Live",
  reconnecting: "Reconnecting…",
  error: "Error",
};

interface Props {
  refreshKey: number;
  /** Local entries from just-succeeded writes, shown until the real event stream catches up. */
  optimisticItems?: OptimisticActivity[];
}

export function ActivityFeed({ refreshKey, optimisticItems = [] }: Props) {
  const { items, state, error } = useEventStream({ refreshKey });
  const newestFirst = items.slice().reverse();
  const pending = pruneConfirmed(optimisticItems, items);

  return (
    <section className="panel">
      <h2>Live Activity</h2>
      <p className="muted">
        Recent contract activity, polled from testnet events.{" "}
        <span className={`stream-status stream-status-${state}`}>{STATUS_LABELS[state]}</span>
      </p>
      {error && <p className="error">{error}</p>}
      {pending.length === 0 && items.length === 0 && state === "loading" && (
        <p className="muted">Loading activity…</p>
      )}
      {pending.length === 0 && items.length === 0 && state !== "loading" && !error && (
        <p className="muted">No activity yet.</p>
      )}
      {pending.length > 0 && (
        <ul className="activity-list">
          {pending.map((item) => (
            <li key={item.id} className="activity-local">
              <span className="local-badge">Syncing…</span> <strong>{item.action}</strong>
              {item.bountyId !== null && <> — bounty #{item.bountyId}</>} by{" "}
              <code>{item.actor.slice(0, 8)}…</code>
              {item.amount !== undefined && <> ({item.amount.toString()} stroops)</>}
            </li>
          ))}
        </ul>
      )}
      <ul className="activity-list">
        {newestFirst.map((item) => (
          <li key={item.id}>
            <strong>{item.action}</strong> — bounty #{item.bountyId} by{" "}
            <code>{item.actor.slice(0, 8)}…</code> ({item.amount.toString()} stroops)
            <span className="muted"> · ledger {item.ledger}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
