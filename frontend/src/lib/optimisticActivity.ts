import type { ActivityItem } from "./events";

export interface OptimisticActivity {
  id: string;
  action: string;
  bountyId: number | null;
  actor: string;
  amount?: bigint;
}

/** What a caller (e.g. ContractPanel) provides after a write succeeds — everything but the generated id. */
export type OptimisticActivityInput = Omit<OptimisticActivity, "id">;

let counter = 0;

/**
 * Builds a local activity entry right after a write action succeeds — shown
 * immediately, before the real event has had a chance to show up in the
 * polled RPC event stream. `bountyId` is null for actions with no bounty
 * (e.g. initialize), which also means it can never match a real event —
 * that entry just stays marked local/syncing indefinitely, which is fine
 * since the contract never emits an "initialized" event either.
 */
export function createOptimisticActivity(input: OptimisticActivityInput): OptimisticActivity {
  counter += 1;
  return { id: `local-${Date.now()}-${counter}`, ...input };
}

/** Conservative match: same action, same bounty, same actor. Amount isn't compared — we often don't know it locally. */
function isConfirmedBy(optimistic: OptimisticActivity, item: ActivityItem): boolean {
  return (
    optimistic.action === item.action &&
    optimistic.bountyId === item.bountyId &&
    optimistic.actor === item.actor
  );
}

/** Drops optimistic entries once a matching real event has arrived, so the feed never shows the same activity twice. */
export function pruneConfirmed(
  optimistic: OptimisticActivity[],
  streamItems: ActivityItem[],
): OptimisticActivity[] {
  if (optimistic.length === 0 || streamItems.length === 0) return optimistic;
  return optimistic.filter((o) => !streamItems.some((item) => isConfirmedBy(o, item)));
}
