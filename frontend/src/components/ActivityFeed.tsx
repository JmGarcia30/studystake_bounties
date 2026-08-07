import { useEventStream, type ConnectionState } from "../hooks/useEventStream";

const STATUS_LABELS: Record<ConnectionState, string> = {
  loading: "Connecting…",
  live: "Live",
  reconnecting: "Reconnecting…",
  error: "Error",
};

export function ActivityFeed({ refreshKey }: { refreshKey: number }) {
  const { items, state, error } = useEventStream({ refreshKey });
  const newestFirst = items.slice().reverse();

  return (
    <section className="panel">
      <h2>Live Activity</h2>
      <p className="muted">
        Recent contract activity, polled from testnet events.{" "}
        <span className={`stream-status stream-status-${state}`}>{STATUS_LABELS[state]}</span>
      </p>
      {error && <p className="error">{error}</p>}
      {items.length === 0 && state === "loading" && <p className="muted">Loading activity…</p>}
      {items.length === 0 && state !== "loading" && !error && (
        <p className="muted">No activity yet.</p>
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
