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
});
