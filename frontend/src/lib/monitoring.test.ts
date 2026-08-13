import { describe, expect, it, vi } from "vitest";
import { captureException, initializeMonitoring } from "./monitoring";

function sdkDouble() {
  return { init: vi.fn(), captureException: vi.fn() };
}

describe("monitoring", () => {
  it("stays disabled without a public Sentry DSN", async () => {
    const sdk = sdkDouble();
    expect(await initializeMonitoring({}, sdk)).toBe(false);
    captureException(new Error("not sent"), undefined, sdk);
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.captureException).not.toHaveBeenCalled();
  });

  it("initializes Sentry without default PII and reports captured errors", async () => {
    const sdk = sdkDouble();
    expect(await initializeMonitoring({
      VITE_SENTRY_DSN: "https://public@example.ingest.sentry.io/123",
      VITE_APP_ENV: "testnet-production",
      VITE_APP_RELEASE: "phase-4",
    }, sdk)).toBe(true);
    expect(sdk.init).toHaveBeenCalledWith(expect.objectContaining({
      sendDefaultPii: false, environment: "testnet-production", release: "phase-4",
    }));
    const error = new Error("captured");
    captureException(error, { extra: { source: "test" } }, sdk);
    expect(sdk.captureException).toHaveBeenCalledWith(error, { extra: { source: "test" } });
  });
});
