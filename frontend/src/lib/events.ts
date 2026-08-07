import { rpc, scValToNative, type xdr } from "@stellar/stellar-sdk";
import { getConfig } from "./config";

export interface ActivityItem {
  id: string;
  ledger: number;
  closedAt: string;
  action: string;
  bountyId: number;
  actor: string;
  amount: bigint;
  txIndex: number;
  opIndex: number;
}

/**
 * The subset of an RPC event response this app actually reads — decoupled
 * from the SDK's exact response type so fixtures don't need a live RPC call.
 * Matches `rpc.Api.EventResponse`'s shape closely enough that a real
 * `getEvents()` result satisfies it directly.
 */
export interface RawContractEvent {
  id: string;
  ledger: number;
  ledgerClosedAt: string;
  transactionIndex?: number;
  operationIndex?: number;
  topic: xdr.ScVal[];
  value: xdr.ScVal;
}

/**
 * Decodes one RPC event into an ActivityItem, or returns null if it doesn't
 * match the [action, bountyId, actor, amount] shape this app's events use —
 * e.g. an event from a future contract version, or upstream noise.
 */
export function decodeEvent(event: RawContractEvent): ActivityItem | null {
  try {
    const topic = event.topic.map((t) => scValToNative(t));
    const action = topic[1];
    if (typeof action !== "string") return null;

    const decodedValue = scValToNative(event.value);
    if (!Array.isArray(decodedValue) || decodedValue.length < 3) return null;
    const [bountyId, actor, amount] = decodedValue as [unknown, unknown, unknown];
    if (typeof bountyId !== "number" || typeof actor !== "string" || typeof amount !== "bigint") {
      return null;
    }

    return {
      id: event.id,
      ledger: event.ledger,
      closedAt: event.ledgerClosedAt,
      action,
      bountyId,
      actor,
      amount,
      txIndex: event.transactionIndex ?? 0,
      opIndex: event.operationIndex ?? 0,
    };
  } catch {
    return null;
  }
}

/** Decodes a batch, silently dropping any event that doesn't match the expected shape. */
export function decodeEvents(events: RawContractEvent[]): ActivityItem[] {
  return events.map(decodeEvent).filter((item): item is ActivityItem => item !== null);
}

/** Stable chronological order: ledger, then position within it. Oldest first. */
export function sortActivity(items: ActivityItem[]): ActivityItem[] {
  return items
    .slice()
    .sort((a, b) => a.ledger - b.ledger || a.txIndex - b.txIndex || a.opIndex - b.opIndex);
}

/** Merges newly fetched items into an existing list, dropping duplicates by event id. */
export function mergeActivity(
  existing: ActivityItem[],
  incoming: ActivityItem[],
): ActivityItem[] {
  if (incoming.length === 0) return existing;
  const seen = new Set(existing.map((item) => item.id));
  const merged = existing.slice();
  for (const item of incoming) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      merged.push(item);
    }
  }
  return sortActivity(merged);
}

let server: rpc.Server | null = null;

/** Lazily constructed so a bad RPC URL fails inside a call, not at module load. */
function getServer(): rpc.Server {
  if (!server) {
    server = new rpc.Server(getConfig().rpcUrl);
  }
  return server;
}

const EVENT_LOOKBACK_LEDGERS = 720; // ~1hr at ~5s/ledger

export interface EventPage {
  items: ActivityItem[];
  cursor: string;
}

/**
 * Fetches contract events. Pass a `cursor` from a previous page to fetch
 * only events newer than it (RPC's native pagination — no re-fetching or
 * client-side windowing needed); omit it to bootstrap from the last ~1hr
 * of ledgers. Reads events only, so this never needs a connected wallet.
 */
export async function fetchContractEvents(cursor?: string): Promise<EventPage> {
  const svr = getServer();
  const filters = [{ type: "contract" as const, contractIds: [getConfig().contractId] }];

  const response = cursor
    ? await svr.getEvents({ filters, cursor })
    : await svr.getEvents({
        filters,
        startLedger: Math.max((await svr.getLatestLedger()).sequence - EVENT_LOOKBACK_LEDGERS, 1),
      });

  return {
    items: decodeEvents(response.events),
    cursor: response.cursor,
  };
}
