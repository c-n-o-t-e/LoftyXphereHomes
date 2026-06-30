import { isMetaPixelConfigured } from "@/lib/analytics/config";
import { isAnalyticsExcludedPath } from "@/lib/analytics/paths";
import {
  readClientAnalyticsConsent,
  readClientConsentRequired,
  isMarketingAllowedByConsent,
} from "@/lib/analytics/consent";
import { readClientInternalTrafficOptedOut } from "@/lib/analytics/internal";

declare global {
  interface Window {
    fbq?: MetaFbq;
    _fbq?: MetaFbq;
  }
}

type MetaFbq = {
  (
    command: "track" | "trackCustom" | "init",
    eventOrPixelId: string,
    params?: Record<string, string | number | boolean | string[] | undefined>,
    options?: { eventID?: string },
  ): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[];
  push?: MetaFbq;
  loaded?: boolean;
  version?: string;
};

function getFbq(): MetaFbq | undefined {
  if (typeof window === "undefined") return undefined;
  return window.fbq;
}

function isMetaTrackingAllowed(pathname?: string): boolean {
  if (!isMetaPixelConfigured()) return false;
  if (typeof window === "undefined") return false;
  if (readClientInternalTrafficOptedOut()) return false;

  const consentRequired = readClientConsentRequired();
  const consent = readClientAnalyticsConsent();
  if (!isMarketingAllowedByConsent(consentRequired, consent)) return false;

  const path = pathname ?? window.location.pathname;
  return !isAnalyticsExcludedPath(path);
}

function trackMetaStandardEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | string[] | undefined>,
  options?: { eventID?: string },
): void {
  if (!isMetaTrackingAllowed()) return;

  const cleaned = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      )
    : undefined;

  if (options?.eventID) {
    getFbq()?.("track", eventName, cleaned, { eventID: options.eventID });
    return;
  }

  getFbq()?.("track", eventName, cleaned);
}

/** Sends Meta Pixel PageView (initial load handled in MetaPixel script). */
export function trackMetaPageView(): void {
  trackMetaStandardEvent("PageView");
}

/** Apartment detail view — standard ViewContent for retargeting catalog audiences. */
export function trackMetaViewContent(params: {
  apartmentId: string;
  apartmentName: string;
  value?: number;
  currency?: string;
}): void {
  trackMetaStandardEvent("ViewContent", {
    content_ids: [params.apartmentId],
    content_type: "product",
    content_name: params.apartmentName,
    content_category: "short_term_rental",
    value: params.value,
    currency: params.currency ?? "NGN",
  });
}

/** Ads landing page (/book) — top-of-funnel for Meta campaign optimization. */
export function trackMetaInitiateCheckout(params?: {
  value?: number;
  currency?: string;
}): void {
  trackMetaStandardEvent("InitiateCheckout", {
    content_category: "short_term_rental",
    num_items: 1,
    value: params?.value,
    currency: params?.currency ?? "NGN",
  });
}

/** Contact form submission — standard Lead event. */
export function trackMetaLead(params: { label?: string }): void {
  trackMetaStandardEvent("Lead", {
    content_name: params.label ?? "Contact Form",
    content_category: "short_term_rental",
  });
}

/** Confirmed booking — standard Purchase with optional dedup eventID. */
export function trackMetaPurchase(params: {
  reference?: string;
  value?: number;
  currency?: string;
  apartmentId?: string;
}): void {
  trackMetaStandardEvent(
    "Purchase",
    {
      value: params.value,
      currency: params.currency ?? "NGN",
      content_ids: params.apartmentId ? [params.apartmentId] : undefined,
      content_type: "product",
      content_category: "short_term_rental",
      num_items: 1,
    },
    params.reference ? { eventID: params.reference } : undefined,
  );
}

/** WhatsApp / phone CTAs — Contact standard event plus custom name for reporting. */
export function trackMetaContact(params: {
  label: string;
  channel: "whatsapp" | "phone";
  apartmentId?: string;
}): void {
  trackMetaStandardEvent("Contact", {
    content_name: params.label,
    content_category: params.channel,
    content_ids: params.apartmentId ? [params.apartmentId] : undefined,
  });

  trackMetaCustomEvent(`${params.channel}_click`, {
    content_name: params.label,
    apartment_id: params.apartmentId,
  });
}

function trackMetaCustomEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (!isMetaTrackingAllowed()) return;

  const cleaned = params
    ? Object.fromEntries(
        Object.entries(params).filter(([, value]) => value !== undefined),
      )
    : undefined;

  getFbq()?.("trackCustom", eventName, cleaned);
}
