import { describe, expect, it } from "vitest";
import { nativeToScVal, xdr } from "@stellar/stellar-sdk";
import { decodeEvent, decodeEvents, mergeActivity, sortActivity, type RawContractEvent } from "./events";

const ACTOR = "GBUFJT7DPW2JELFSBRZJR53DCYRGG7BX4LA2ECJB7PUDXGP33EKJVJBF";

function makeEvent(overrides: Partial<RawContractEvent> = {}): RawContractEvent {
  return {
    id: "0000000001-0000000000",
    ledger: 100,
    ledgerClosedAt: "2026-01-01T00:00:00Z",
    transactionIndex: 1,
    operationIndex: 0,
    topic: [
      nativeToScVal("bounty", { type: "symbol" }),
      nativeToScVal("accepted", { type: "symbol" }),
    ],
    value: nativeToScVal([3, ACTOR, 500n], { type: ["u32", "address", "i128"] }),
    ...overrides,
  };
}

describe("decodeEvent", () => {
  it("decodes a valid RPC event fixture into an ActivityItem", () => {
    const item = decodeEvent(makeEvent());
    expect(item).toEqual({
      id: "0000000001-0000000000",
      ledger: 100,
      closedAt: "2026-01-01T00:00:00Z",
      action: "accepted",
      bountyId: 3,
      actor: ACTOR,
      amount: 500n,
      txIndex: 1,
      opIndex: 0,
    });
  });

  it("defaults txIndex/opIndex to 0 when the RPC response omits them", () => {
    const item = decodeEvent(
      makeEvent({ transactionIndex: undefined, operationIndex: undefined }),
    );
    expect(item?.txIndex).toBe(0);
    expect(item?.opIndex).toBe(0);
  });

  it("returns null when the topic's action entry isn't a string", () => {
    const event = makeEvent({
      topic: [nativeToScVal("bounty", { type: "symbol" }), nativeToScVal(42, { type: "u32" })],
    });
    expect(decodeEvent(event)).toBeNull();
  });

  it("returns null when the value isn't the expected [bountyId, actor, amount] tuple", () => {
    const event = makeEvent({ value: nativeToScVal("unexpected", { type: "string" }) });
    expect(decodeEvent(event)).toBeNull();
  });

  it("returns null when the value tuple has the wrong field types", () => {
    const event = makeEvent({
      value: nativeToScVal(["not-a-number", ACTOR, 500n], {
        type: ["string", "address", "i128"],
      }),
    });
    expect(decodeEvent(event)).toBeNull();
  });

  it("returns null instead of throwing on a malformed ScVal", () => {
    const event = makeEvent({ value: xdr.ScVal.scvVoid() });
    expect(decodeEvent(event)).toBeNull();
  });
});

describe("decodeEvents", () => {
  it("drops malformed events while keeping valid ones from the same batch", () => {
    const valid = makeEvent();
    const malformed = makeEvent({ id: "bad", value: xdr.ScVal.scvVoid() });
    expect(decodeEvents([valid, malformed]).map((i) => i.id)).toEqual([valid.id]);
  });
});

describe("sortActivity", () => {
  it("orders events by ledger, then transaction index, then operation index", () => {
    const a = decodeEvent(makeEvent({ id: "a", ledger: 100, transactionIndex: 2, operationIndex: 0 }))!;
    const b = decodeEvent(makeEvent({ id: "b", ledger: 99, transactionIndex: 5, operationIndex: 5 }))!;
    const c = decodeEvent(makeEvent({ id: "c", ledger: 100, transactionIndex: 1, operationIndex: 9 }))!;
    expect(sortActivity([a, b, c]).map((i) => i.id)).toEqual(["b", "c", "a"]);
  });
});

describe("mergeActivity", () => {
  it("appends new events without dropping existing ones", () => {
    const existing = [decodeEvent(makeEvent({ id: "1", ledger: 100 }))!];
    const incoming = [decodeEvent(makeEvent({ id: "2", ledger: 101 }))!];
    expect(mergeActivity(existing, incoming).map((i) => i.id)).toEqual(["1", "2"]);
  });

  it("deduplicates events that already exist by id", () => {
    const existing = [decodeEvent(makeEvent({ id: "1", ledger: 100 }))!];
    const incoming = [
      decodeEvent(makeEvent({ id: "1", ledger: 100 }))!,
      decodeEvent(makeEvent({ id: "2", ledger: 101 }))!,
    ];
    const merged = mergeActivity(existing, incoming);
    expect(merged.map((i) => i.id)).toEqual(["1", "2"]);
  });

  it("returns the existing list unchanged when there's nothing new", () => {
    const existing = [decodeEvent(makeEvent({ id: "1" }))!];
    expect(mergeActivity(existing, [])).toBe(existing);
  });
});
