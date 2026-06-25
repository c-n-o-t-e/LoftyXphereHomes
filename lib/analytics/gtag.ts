import { getGaMeasurementId, isGaConfigured } from "@/lib/analytics/config";
import { isAnalyticsExcludedPath } from "@/lib/analytics/paths";

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

function isTrackingAllowed(pathname?: string): boolean {
  if (!isGaConfigured()) return false;
  if (typeof window === "undefined") return false;

  const path = pathname ?? window.location.pathname;
  return !isAnalyticsExcludedPath(path);
}

/** Sends a GA4 page_view for client-side route changes. */
export function pageview(url: string): void {
  const pagePath = url.split("?")[0] ?? url;
  if (!isTrackingAllowed(pagePath)) return;

  getGtag()?.("config", getGaMeasurementId(), {
    page_path: url,
  });
}

export function sendGaEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (!isTrackingAllowed()) return;

  const cleaned = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      )
    : undefined;

  getGtag()?.("event", eventName, cleaned);
}
