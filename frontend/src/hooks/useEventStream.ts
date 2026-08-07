import { useEffect, useRef, useState } from "react";
import { fetchContractEvents, mergeActivity, type ActivityItem, type EventPage } from "../lib/events";
import { toFriendlyError } from "../lib/errors";

export type ConnectionState = "loading" | "live" | "reconnecting" | "error";

export interface UseEventStreamOptions {
  /** Bump this (e.g. after a successful transaction) to poll immediately instead of waiting. */
  refreshKey?: number;
  pollIntervalMs?: number;
  /** Injectable for tests; defaults to the real RPC-backed fetch. */
  fetchPage?: (cursor?: string) => Promise<EventPage>;
}

export interface UseEventStreamResult {
  items: ActivityItem[];
  state: ConnectionState;
  error: string | null;
}

const DEFAULT_POLL_MS = 6000;
const MAX_BACKOFF_MS = 60_000;

/**
 * Polls contract events via RPC's cursor pagination: the first fetch
 * bootstraps from the last ~1hr of ledgers, every fetch after that asks
 * only for events newer than the previous page's cursor. New events are
 * merged (deduplicated by id) into the existing list rather than replacing
 * it, so a transient failure never blanks out what's already on screen.
 */
export function useEventStream(options: UseEventStreamOptions = {}): UseEventStreamResult {
  const { refreshKey, pollIntervalMs = DEFAULT_POLL_MS, fetchPage = fetchContractEvents } =
    options;

  const [items, setItems] = useState<ActivityItem[]>([]);
  const [state, setState] = useState<ConnectionState>("loading");
  const [error, setError] = useState<string | null>(null);

  const cursorRef = useRef<string | undefined>(undefined);
  const failuresRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    async function tick() {
      try {
        const page = await fetchPage(cursorRef.current);
        if (cancelled) return;
        cursorRef.current = page.cursor;
        failuresRef.current = 0;
        setItems((prev) => mergeActivity(prev, page.items));
        setError(null);
        setState("live");
      } catch (err) {
        if (cancelled) return;
        failuresRef.current += 1;
        setError(toFriendlyError(err).message);
        // "error" only when we've never successfully loaded anything; once
        // live, a transient failure is a "reconnecting" blip, not a wipeout.
        setState((prev) => (prev === "live" || prev === "reconnecting" ? "reconnecting" : "error"));
      } finally {
        if (!cancelled) {
          const delay =
            failuresRef.current > 0
              ? Math.min(pollIntervalMs * 2 ** failuresRef.current, MAX_BACKOFF_MS)
              : pollIntervalMs;
          timer = setTimeout(tick, delay);
        }
      }
    }

    tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [refreshKey, pollIntervalMs, fetchPage]);

  return { items, state, error };
}
