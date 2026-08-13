import { describe, expect, it, vi } from "vitest";
import { createAnalyticsProvider } from "./analytics";

function browserDoubles() {
  const appended: unknown[] = [];
  const browserWindow: { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void } = {};
  const browserDocument = {
    createElement: vi.fn(() => ({ async: false, src: "" })),
    head: { appendChild: vi.fn((node: unknown) => appended.push(node)) },
  };
  return { browserWindow, browserDocument, appended };
}

describe("analytics", () => {
  it("uses a no-op provider when the analytics environment value is missing", () => {
    const { browserWindow, browserDocument } = browserDoubles();
    const provider = createAnalyticsProvider({}, browserWindow, browserDocument);
    expect(provider.enabled).toBe(false);
    expect(() => provider.track("wallet_connected")).not.toThrow();
    expect(browserDocument.head.appendChild).not.toHaveBeenCalled();
  });

  it("initializes GA4 and tracks product events through the abstraction", () => {
    const { browserWindow, browserDocument } = browserDoubles();
    const provider = createAnalyticsProvider(
      { VITE_GA_MEASUREMENT_ID: "G-TEST123" }, browserWindow, browserDocument,
    );
    expect(provider.enabled).toBe(true);
    expect(browserDocument.head.appendChild).toHaveBeenCalledOnce();
    provider.track("proof_submitted", { bounty_id: 10 });
    expect(browserWindow.dataLayer).toContainEqual([
      "event", "proof_submitted", { bounty_id: 10 },
    ]);
  });
});
