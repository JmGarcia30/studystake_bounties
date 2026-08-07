import { describe, expect, it } from "vitest";
import { toFriendlyError } from "./errors";

describe("toFriendlyError", () => {
  it("maps missing-wallet errors to a friendly install prompt", () => {
    expect(toFriendlyError(new Error("No modules available")).message).toBe(
      "No Stellar wallet detected. Install Freighter (or another supported wallet) and try again.",
    );
  });

  it("maps 'not installed' errors to the same install prompt", () => {
    expect(toFriendlyError(new Error("Freighter is not installed")).message).toBe(
      "No Stellar wallet detected. Install Freighter (or another supported wallet) and try again.",
    );
  });

  it("maps user rejection errors to a cancellation message", () => {
    expect(toFriendlyError(new Error("User declined access")).message).toBe(
      "You cancelled the request in your wallet.",
    );
  });

  it("maps user-closed-modal errors to the same cancellation message", () => {
    expect(toFriendlyError(new Error("User closed the modal")).message).toBe(
      "You cancelled the request in your wallet.",
    );
  });

  it("passes through unrecognized error messages unchanged", () => {
    expect(toFriendlyError(new Error("simulation failed: insufficient balance")).message).toBe(
      "simulation failed: insufficient balance",
    );
  });

  it("stringifies non-Error values", () => {
    expect(toFriendlyError("boom").message).toBe("boom");
  });

  describe("contract error code mapping", () => {
    const fixtures: Array<[code: number, expected: string]> = [
      [1, "This contract has already been initialized."],
      [2, "This contract has not been initialized yet."],
      [3, "Enter a positive amount."],
      [4, "No bounty exists with that ID."],
      [5, "This bounty is not open."],
      [6, "This bounty has not been accepted yet."],
      [7, "Only the buyer of this bounty can do that."],
      [8, "Only the contract admin can do that."],
      [9, "This bounty doesn't have a tutor assigned yet."],
      [10, "This bounty has already been completed."],
      [11, "You're not authorized to do that."],
    ];

    it.each(fixtures)("maps contract error #%i to a friendly message", (code, expected) => {
      const raw = `HostError: Error(Contract, #${code})\n\nEvent log (newest first):\n   0: ...`;
      expect(toFriendlyError(new Error(raw)).message).toBe(expected);
    });

    it("matches the compact simulation-error form without extra context", () => {
      expect(toFriendlyError(new Error("Error(Contract, #4)")).message).toBe(
        "No bounty exists with that ID.",
      );
    });

    it("falls back to a generic message for an unknown contract error code", () => {
      expect(toFriendlyError(new Error("Error(Contract, #99)")).message).toBe(
        "Contract rejected the transaction (error #99).",
      );
    });
  });
});
