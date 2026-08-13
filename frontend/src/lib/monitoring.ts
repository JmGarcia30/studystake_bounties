interface MonitoringSdk {
  init(options: { dsn: string; environment: string; release?: string; sendDefaultPii: boolean }): void;
  captureException(error: unknown, context?: { extra?: Record<string, unknown> }): unknown;
}

let monitoringEnabled = false;
let activeSdk: MonitoringSdk | null = null;

function configuredDsn(value: string | undefined): value is string {
  if (!value?.trim() || /^<.*>$/.test(value.trim())) return false;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export async function initializeMonitoring(
  env: Record<string, string | undefined> = import.meta.env,
  sdk?: MonitoringSdk,
): Promise<boolean> {
  const dsn = env.VITE_SENTRY_DSN;
  if (!configuredDsn(dsn)) {
    monitoringEnabled = false;
    activeSdk = null;
    return false;
  }

  try {
    const resolvedSdk: MonitoringSdk = sdk ?? await import("@sentry/react");
    resolvedSdk.init({
      dsn: dsn.trim(),
      environment: env.VITE_APP_ENV?.trim() || env.MODE || "production",
      release: env.VITE_APP_RELEASE?.trim() || undefined,
      sendDefaultPii: false,
    });
    activeSdk = resolvedSdk;
    monitoringEnabled = true;
    return true;
  } catch (error) {
    activeSdk = null;
    monitoringEnabled = false;
    console.warn("Error monitoring initialization failed; continuing without monitoring.", error);
    return false;
  }
}

export function captureException(
  error: unknown,
  context?: { extra?: Record<string, unknown> },
  sdk?: MonitoringSdk,
): void {
  const resolvedSdk = sdk ?? activeSdk;
  if (!monitoringEnabled || !resolvedSdk) return;
  try {
    resolvedSdk.captureException(error, context);
  } catch (captureError) {
    console.warn("Error monitoring report could not be sent.", captureError);
  }
}
