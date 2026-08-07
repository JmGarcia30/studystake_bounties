import { describe, expect, it } from "vitest";
import { createOptimisticActivity, pruneConfirmed } from "./optimisticActivity";
import type { ActivityItem } from "./events";

const ACTOR = "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF";

function makeStreamItem(overrides: Partial<ActivityItem> = {}): ActivityItem {
  return {
    id: "0000000001-0000000000",
    ledger: 100,
    closedAt: "2026-01-01T00:00:00Z",
    action: "created",
    bountyId: 3,
    actor: ACTOR,
    amount: 500n,
    txIndex: 0,
    opIndex: 0,
    ...overrides,
  };
}

describe("createOptimisticActivity", () => {
  it("assigns a unique local id and carries through the given fields", () => {
    const a = createOptimisticActivity({ action: "created", bountyId: 3, actor: ACTOR, amount: 500n });
    const b = createOptimisticActivity({ action: "accepted", bountyId: 4, actor: ACTOR });
    expect(a.id).not.toBe(b.id);
    expect(a).toMatchObject({ action: "created", bountyId: 3, actor: ACTOR, amount: 500n });
    expect(b).toMatchObject({ action: "accepted", bountyId: 4, actor: ACTOR });
    expect(b.amount).toBeUndefined();
  });
});

describe("pruneConfirmed", () => {
  it("keeps an optimistic entry when no matching real event has arrived yet", () => {
    const optimistic = [
      createOptimisticActivity({ action: "created", bountyId: 3, actor: ACTOR, amount: 500n }),
    ];
    expect(pruneConfirmed(optimistic, [])).toEqual(optimistic);
  });

  it("drops an optimistic entry once a real event matches action, bounty, and actor", () => {
    const optimistic = [
      createOptimisticActivity({ action: "created", bountyId: 3, actor: ACTOR, amount: 500n }),
    ];
    const stream = [makeStreamItem({ action: "created", bountyId: 3, actor: ACTOR })];
    expect(pruneConfirmed(optimistic, stream)).toEqual([]);
  });

  it("does not drop entries for a different bounty id, action, or actor", () => {
    const optimistic = [
      createOptimisticActivity({ action: "created", bountyId: 3, actor: ACTOR, amount: 500n }),
    ];
    const otherActor = "GDIFFERENT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJV";
    const stream = [
      makeStreamItem({ action: "created", bountyId: 4, actor: ACTOR }),
      makeStreamItem({ action: "accepted", bountyId: 3, actor: ACTOR }),
      makeStreamItem({ action: "created", bountyId: 3, actor: otherActor }),
    ];
    expect(pruneConfirmed(optimistic, stream)).toEqual(optimistic);
  });

  it("never matches a null bountyId (e.g. initialize) against any real event", () => {
    const optimistic = [createOptimisticActivity({ action: "initialized", bountyId: null, actor: ACTOR })];
    const stream = [makeStreamItem({ action: "initialized", bountyId: 3, actor: ACTOR })];
    expect(pruneConfirmed(optimistic, stream)).toEqual(optimistic);
  });

  it("leaves unrelated optimistic entries in place while dropping the confirmed one", () => {
    const confirmed = createOptimisticActivity({
      action: "created",
      bountyId: 3,
      actor: ACTOR,
      amount: 500n,
    });
    const stillPending = createOptimisticActivity({ action: "accepted", bountyId: 4, actor: ACTOR });
    const stream = [makeStreamItem({ action: "created", bountyId: 3, actor: ACTOR })];
    expect(pruneConfirmed([confirmed, stillPending], stream)).toEqual([stillPending]);
  });
});
