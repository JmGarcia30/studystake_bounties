import { describe, expect, it } from "vitest";
import { validateConfig } from "./config";

const VALID_ENV = {
  VITE_CONTRACT_ID: "CCEBMZKEH4GBRZVYDDGMSXWCHTL57ZIG6YRVZWRHTU4BP6QZVWQPXI7I",
  VITE_TOKEN_ID: "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  VITE_RPC_URL: "https://soroban-testnet.stellar.org",
  VITE_HORIZON_URL: "https://horizon-testnet.stellar.org",
  VITE_NETWORK_PASSPHRASE: "Test SDF Network ; September 2015",
};

describe("validateConfig", () => {
  it("returns typed config for valid env values", () => {
    expect(validateConfig(VALID_ENV)).toEqual({
      contractId: VALID_ENV.VITE_CONTRACT_ID,
      tokenId: VALID_ENV.VITE_TOKEN_ID,
      rpcUrl: VALID_ENV.VITE_RPC_URL,
      horizonUrl: VALID_ENV.VITE_HORIZON_URL,
      networkPassphrase: VALID_ENV.VITE_NETWORK_PASSPHRASE,
    });
  });

  it("throws a clear error when a required value is missing", () => {
    const { VITE_CONTRACT_ID, ...rest } = VALID_ENV;
    void VITE_CONTRACT_ID;
    expect(() => validateConfig(rest)).toThrow(/VITE_CONTRACT_ID is missing/);
  });

  it("throws when a required value is an empty string", () => {
    expect(() => validateConfig({ ...VALID_ENV, VITE_RPC_URL: "" })).toThrow(
      /VITE_RPC_URL is missing/,
    );
  });

  it("throws when a value is still the .env.example placeholder", () => {
    expect(() =>
      validateConfig({ ...VALID_ENV, VITE_CONTRACT_ID: "<DEPLOYED_CONTRACT_ADDRESS>" }),
    ).toThrow(/VITE_CONTRACT_ID still has a placeholder value/);
  });

  it("throws when the contract id isn't a valid Stellar contract address", () => {
    expect(() => validateConfig({ ...VALID_ENV, VITE_CONTRACT_ID: "not-a-contract-id" })).toThrow(
      /VITE_CONTRACT_ID is not a valid Stellar contract address/,
    );
  });

  it("throws when the token id isn't a valid Stellar contract address", () => {
    expect(() => validateConfig({ ...VALID_ENV, VITE_TOKEN_ID: "abc123" })).toThrow(
      /VITE_TOKEN_ID is not a valid Stellar contract address/,
    );
  });

  it("throws when the RPC URL is not a valid URL", () => {
    expect(() => validateConfig({ ...VALID_ENV, VITE_RPC_URL: "not a url" })).toThrow(
      /VITE_RPC_URL is not a valid URL/,
    );
  });

  it("throws when the Horizon URL is not a valid URL", () => {
    expect(() => validateConfig({ ...VALID_ENV, VITE_HORIZON_URL: "not a url" })).toThrow(
      /VITE_HORIZON_URL is not a valid URL/,
    );
  });

  it("reports every problem at once instead of stopping at the first", () => {
    try {
      validateConfig({ ...VALID_ENV, VITE_CONTRACT_ID: "", VITE_TOKEN_ID: "" });
      expect.unreachable();
    } catch (err) {
      const message = (err as Error).message;
      expect(message).toContain("VITE_CONTRACT_ID is missing");
      expect(message).toContain("VITE_TOKEN_ID is missing");
    }
  });
});
