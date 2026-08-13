export type AnalyticsEventName =
  | "wallet_connected"
  | "proof_submitted"
  | "xlm_payment_sent"
  | "escrow_created"
  | "bounty_accepted"
  | "reward_released"
  | "feedback_submitted"
  | "evidence_page_viewed";

export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

interface AnalyticsProvider {
  readonly enabled: boolean;
  track(eventName: AnalyticsEventName, properties?: AnalyticsProperties): void;
}

interface AnalyticsWindow {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}

interface AnalyticsDocument {
  createElement(tagName: string): { async: boolean; src: string };
  head: { appendChild(node: unknown): unknown };
}

const noOpProvider: AnalyticsProvider = { enabled: false, track: () => undefined };
let activeProvider = noOpProvider;

function configuredMeasurementId(value: string | undefined): value is string {
  return Boolean(value?.trim() && !/^<.*>$/.test(value.trim()));
}

export function createAnalyticsProvider(
  env: Record<string, string | undefined>,
  browserWindow?: AnalyticsWindow,
  browserDocument?: AnalyticsDocument,
): AnalyticsProvider {
  const measurementId = env.VITE_GA_MEASUREMENT_ID;
  if (!configuredMeasurementId(measurementId) || !browserWindow || !browserDocument) return noOpProvider;

  try {
    browserWindow.dataLayer ??= [];
    browserWindow.gtag = (...args: unknown[]) => { browserWindow.dataLayer!.push(args); };
    browserWindow.gtag("js", new Date());
    browserWindow.gtag("config", measurementId.trim(), { anonymize_ip: true });

    const script = browserDocument.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId.trim())}`;
    browserDocument.head.appendChild(script);

    return {
      enabled: true,
      track(eventName, properties = {}) {
        browserWindow.gtag?.("event", eventName, properties);
      },
    };
  } catch (error) {
    console.warn("Analytics initialization failed; continuing without analytics.", error);
    return noOpProvider;
  }
}

export function initializeAnalytics(env: Record<string, string | undefined> = import.meta.env): boolean {
  activeProvider = createAnalyticsProvider(
    env,
    typeof window === "undefined" ? undefined : window as unknown as AnalyticsWindow,
    typeof document === "undefined" ? undefined : document,
  );
  return activeProvider.enabled;
}

export function trackEvent(eventName: AnalyticsEventName, properties?: AnalyticsProperties): void {
  try {
    activeProvider.track(eventName, properties);
  } catch (error) {
    console.warn(`Analytics event ${eventName} was not recorded.`, error);
  }
}
