import { getGaMeasurementId, isGaConfigured } from "@/lib/analytics/config";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag.Gtag;
  }
}

export namespace Gtag {
  export type Gtag = (
    command: "config" | "event" | "js" | "set",
    targetId: string | Date,
    config?: Record<string, unknown>,
  ) => void;
}

function getGtag(): Gtag.Gtag | undefined {
  if (typeof window === "undefined") return undefined;
  return window.gtag;
}

/** Sends a GA4 page_view for client-side route changes. */
export function pageview(url: string): void {
  if (!isGaConfigured()) return;

  getGtag()?.("config", getGaMeasurementId(), {
    page_path: url,
  });
}

export function sendGaEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (!isGaConfigured()) return;

  const cleaned = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      )
    : undefined;

  getGtag()?.("event", eventName, cleaned);
}
