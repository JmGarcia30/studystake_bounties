import { describe, expect, it } from "vitest";
import { getReputationContractId, isReputationConfigured } from "./reputation";

describe("getReputationContractId", () => {
  it("returns the configured contract id", () => {
    expect(
      getReputationContractId({
        VITE_REPUTATION_CONTRACT_ID: "CCEBMZKEH4GBRZVYDDGMSXWCHTL57ZIG6YRVZWRHTU4BP6QZVWQPXI7I",
      }),
    ).toBe("CCEBMZKEH4GBRZVYDDGMSXWCHTL57ZIG6YRVZWRHTU4BP6QZVWQPXI7I");
  });

  it("returns null when the env var is missing", () => {
    expect(getReputationContractId({})).toBeNull();
  });

  it("returns null when the env var is an empty string", () => {
    expect(getReputationContractId({ VITE_REPUTATION_CONTRACT_ID: "" })).toBeNull();
  });

  it("returns null when the env var is still a placeholder", () => {
    expect(
      getReputationContractId({ VITE_REPUTATION_CONTRACT_ID: "<REPUTATION_CONTRACT_ADDRESS>" }),
    ).toBeNull();
  });
});

describe("isReputationConfigured", () => {
  it("is true when a real contract id is set", () => {
    expect(
      isReputationConfigured({
        VITE_REPUTATION_CONTRACT_ID: "CCEBMZKEH4GBRZVYDDGMSXWCHTL57ZIG6YRVZWRHTU4BP6QZVWQPXI7I",
      }),
    ).toBe(true);
  });

  it("is false when unset", () => {
    expect(isReputationConfigured({})).toBe(false);
  });
});
