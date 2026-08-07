import { describe, expect, it } from "vitest";
import { xlmToStroops } from "./amount";

describe("xlmToStroops", () => {
  it("converts a whole XLM amount to stroops", () => {
    expect(xlmToStroops("1")).toBe(10_000_000n);
  });

  it("converts a fractional XLM amount to stroops", () => {
    expect(xlmToStroops("2.5")).toBe(25_000_000n);
  });

  it("rounds to the nearest stroop", () => {
    expect(xlmToStroops("0.00000015")).toBe(2n);
  });

  it("rejects zero", () => {
    expect(() => xlmToStroops("0")).toThrow("Enter a positive amount.");
  });

  it("rejects negative amounts", () => {
    expect(() => xlmToStroops("-1")).toThrow("Enter a positive amount.");
  });

  it("rejects non-numeric input", () => {
    expect(() => xlmToStroops("abc")).toThrow("Enter a positive amount.");
  });

  it("rejects empty input", () => {
    expect(() => xlmToStroops("")).toThrow("Enter a positive amount.");
  });
});
