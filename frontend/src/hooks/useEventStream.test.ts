// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { useEventStream } from "./useEventStream";
import type { ActivityItem } from "../lib/events";

function item(id: string, ledger: number): ActivityItem {
  return {
    id,
    ledger,
    closedAt: "2026-01-01T00:00:00Z",
    action: "accepted",
    bountyId: 1,
    actor: "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF",
    amount: 1n,
    txIndex: 0,
    opIndex: 0,
  };
}

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useEventStream", () => {
  it("performs an initial fetch on mount, bootstrapping with no cursor", async () => {
    const fetchPage = vi.fn().mockResolvedValue({ items: [item("1", 100)], cursor: "c1" });
    const { result } = renderHook(() => useEventStream({ fetchPage, pollIntervalMs: 1000 }));

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchPage).toHaveBeenCalledWith(undefined);
    expect(result.current.items.map((i) => i.id)).toEqual(["1"]);
    expect(result.current.state).toBe("live");
  });

  it("appends new events on a later poll instead of replacing the list", async () => {
    vi.useFakeTimers();
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ items: [item("1", 100)], cursor: "c1" })
      .mockResolvedValueOnce({ items: [item("2", 101)], cursor: "c2" });

    const { result } = renderHook(() => useEventStream({ fetchPage, pollIntervalMs: 1000 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.items.map((i) => i.id)).toEqual(["1"]);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(fetchPage).toHaveBeenNthCalledWith(2, "c1");
    expect(result.current.items.map((i) => i.id)).toEqual(["1", "2"]);
  });

  it("deduplicates an event that reappears in a later page", async () => {
    vi.useFakeTimers();
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ items: [item("1", 100)], cursor: "c1" })
      .mockResolvedValueOnce({ items: [item("1", 100), item("2", 101)], cursor: "c2" });

    const { result } = renderHook(() => useEventStream({ fetchPage, pollIntervalMs: 1000 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(result.current.items.map((i) => i.id)).toEqual(["1", "2"]);
  });

  it("exposes an error state after the first fetch fails", async () => {
    vi.useFakeTimers();
    const fetchPage = vi.fn().mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => useEventStream({ fetchPage, pollIntervalMs: 1000 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(result.current.state).toBe("error");
    expect(result.current.error).toMatch(/network down/);
  });

  it("moves to reconnecting (not error) and keeps items after losing a previously-live connection", async () => {
    vi.useFakeTimers();
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ items: [item("1", 100)], cursor: "c1" })
      .mockRejectedValueOnce(new Error("temporary RPC failure"));

    const { result } = renderHook(() => useEventStream({ fetchPage, pollIntervalMs: 1000 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.state).toBe("live");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });

    expect(result.current.state).toBe("reconnecting");
    expect(result.current.items.map((i) => i.id)).toEqual(["1"]);
  });

  it("backs off after repeated failures instead of retrying at a fixed interval", async () => {
    vi.useFakeTimers();
    const fetchPage = vi.fn().mockRejectedValue(new Error("still down"));
    renderHook(() => useEventStream({ fetchPage, pollIntervalMs: 1000 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(fetchPage).toHaveBeenCalledTimes(1);

    // First failure backs off to 2x the base interval (2000ms), not 1000ms —
    // advancing by exactly one base interval should not trigger a retry yet.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(fetchPage).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(fetchPage).toHaveBeenCalledTimes(2);

    // Second failure backs off further, to 4x base (4000ms).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(fetchPage).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(fetchPage).toHaveBeenCalledTimes(3);
  });

  it("stops polling and does not update state after unmount", async () => {
    vi.useFakeTimers();
    const fetchPage = vi.fn().mockResolvedValue({ items: [], cursor: "c1" });
    const { unmount } = renderHook(() => useEventStream({ fetchPage, pollIntervalMs: 1000 }));

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    const callsBeforeUnmount = fetchPage.mock.calls.length;

    unmount();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000);
    });

    expect(fetchPage.mock.calls.length).toBe(callsBeforeUnmount);
  });
});
