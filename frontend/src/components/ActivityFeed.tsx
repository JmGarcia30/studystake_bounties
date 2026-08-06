import { useEffect, useState } from "react";
import { getRecentEvents, type ActivityItem } from "../lib/contract";

const POLL_MS = 6000;

export function ActivityFeed({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const events = await getRecentEvents();
        if (!cancelled) {
          setItems(events.slice().reverse()); // newest first
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      }
    }

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshKey]);

  return (
    <section className="panel">
      <h2>Live Activity</h2>
      <p className="muted">Recent contract activity, polled from testnet events.</p>
      {error && <p className="error">{error}</p>}
      {items.length === 0 && !error && <p className="muted">No activity yet.</p>}
      <ul className="activity-list">
        {items.map((item) => (
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
