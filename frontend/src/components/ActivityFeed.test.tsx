// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { ActivityFeed } from "./ActivityFeed";
import { useEventStream } from "../hooks/useEventStream";
import { createOptimisticActivity } from "../lib/optimisticActivity";
import type { ActivityItem } from "../lib/events";

vi.mock("../hooks/useEventStream", () => ({
  useEventStream: vi.fn(),
}));

const mockUseEventStream = vi.mocked(useEventStream);
const ACTOR = "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF";

function streamItem(overrides: Partial<ActivityItem> = {}): ActivityItem {
  return {
    id: "1",
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

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ActivityFeed", () => {
  it("shows the loading state when there are no real or optimistic items yet", () => {
    mockUseEventStream.mockReturnValue({ items: [], state: "loading", error: null });
    render(<ActivityFeed refreshKey={0} />);
    expect(screen.getByText(/loading activity/i)).toBeInTheDocument();
  });

  it("shows the empty state once loaded with no activity", () => {
    mockUseEventStream.mockReturnValue({ items: [], state: "live", error: null });
    render(<ActivityFeed refreshKey={0} />);
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
  });

  it("shows the error state from the stream", () => {
    mockUseEventStream.mockReturnValue({ items: [], state: "error", error: "network down" });
    render(<ActivityFeed refreshKey={0} />);
    expect(screen.getByText("network down")).toBeInTheDocument();
  });

  it("renders real stream events normally", () => {
    mockUseEventStream.mockReturnValue({
      items: [streamItem({ id: "1", action: "created", bountyId: 3 })],
      state: "live",
      error: null,
    });
    render(<ActivityFeed refreshKey={0} />);
    expect(screen.getByText(/created/)).toBeInTheDocument();
    expect(screen.getByText(/bounty #3/)).toBeInTheDocument();
  });

  it("shows an optimistic entry, labeled as syncing, before the real event arrives", () => {
    mockUseEventStream.mockReturnValue({ items: [], state: "live", error: null });
    const optimistic = createOptimisticActivity({
      action: "created",
      bountyId: 9,
      actor: ACTOR,
      amount: 10_000_000n,
    });
    render(<ActivityFeed refreshKey={0} optimisticItems={[optimistic]} />);

    expect(screen.getByText(/syncing/i)).toBeInTheDocument();
    expect(screen.getByText(/bounty #9/)).toBeInTheDocument();
    expect(screen.queryByText(/no activity yet/i)).not.toBeInTheDocument();
  });

  it("drops the optimistic entry once a matching real event appears in the stream", () => {
    const optimistic = createOptimisticActivity({
      action: "created",
      bountyId: 9,
      actor: ACTOR,
      amount: 10_000_000n,
    });
    mockUseEventStream.mockReturnValue({
      items: [streamItem({ id: "real-1", action: "created", bountyId: 9, actor: ACTOR })],
      state: "live",
      error: null,
    });
    render(<ActivityFeed refreshKey={0} optimisticItems={[optimistic]} />);

    expect(screen.queryByText(/syncing/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/bounty #9/)).toHaveLength(1);
  });

  it("does not break when optimisticItems is omitted", () => {
    mockUseEventStream.mockReturnValue({ items: [], state: "live", error: null });
    render(<ActivityFeed refreshKey={0} />);
    expect(screen.getByText(/no activity yet/i)).toBeInTheDocument();
  });
});
