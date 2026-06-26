import { getGaMeasurementId, isGaConfigured } from "@/lib/analytics/config";
import { isAnalyticsExcludedPath } from "@/lib/analytics/paths";
import {
  readClientAnalyticsConsent,
  readClientConsentRequired,
  isAnalyticsAllowedByConsent,
} from "@/lib/analytics/consent";

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

function hasAnalyticsConsent(): boolean {
  const consentRequired = readClientConsentRequired();
  const consent = readClientAnalyticsConsent();
  return isAnalyticsAllowedByConsent(consentRequired, consent);
}

function isTrackingAllowed(pathname?: string): boolean {
  if (!isGaConfigured()) return false;
  if (typeof window === "undefined") return false;
  if (!hasAnalyticsConsent()) return false;

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
