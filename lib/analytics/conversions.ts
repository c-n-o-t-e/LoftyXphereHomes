import {
  getGoogleAdsConversionId,
  isGoogleAdsConfigured,
} from "@/lib/analytics/config";
import {
  readClientAnalyticsConsent,
  readClientConsentRequired,
  isMarketingAllowedByConsent,
} from "@/lib/analytics/consent";
import { sendGaEvent } from "@/lib/analytics/gtag";
import type { AnalyticsEventCategory } from "@/lib/analytics/events";

export type ConversionMetadata = {
  label: string;
  category?: AnalyticsEventCategory;
  value?: number;
  currency?: string;
  transactionId?: string;
  apartmentId?: string;
};

/** Future Google Ads conversion labels — map to conversion actions in Ads UI. */
export const GOOGLE_ADS_CONVERSION_LABELS = {
  whatsapp: "whatsapp_click",
  phone: "phone_call_click",
  inquiry: "inquiry_submit",
  booking: "booking_complete",
} as const;

export type GoogleAdsConversionKey = keyof typeof GOOGLE_ADS_CONVERSION_LABELS;

/**
 * Stub for Google Ads conversion firing. GA4 events are sent today;
 * when `NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID` is set, wire `gtag('event', 'conversion', …)` here.
 */
export function sendGoogleAdsConversion(
  conversionKey: GoogleAdsConversionKey,
  metadata: ConversionMetadata,
): void {
  if (!isGoogleAdsConfigured()) return;

  const consentRequired = readClientConsentRequired();
  const consent = readClientAnalyticsConsent();
  if (!isMarketingAllowedByConsent(consentRequired, consent)) return;

  const conversionLabel = GOOGLE_ADS_CONVERSION_LABELS[conversionKey];

  sendGaEvent("conversion", {
    send_to: `${getGoogleAdsConversionId()}/${conversionLabel}`,
    value: metadata.value,
    currency: metadata.currency ?? "NGN",
    transaction_id: metadata.transactionId,
    event_label: metadata.label,
  });
}

function trackEngagementConversion(
  conversionKey: GoogleAdsConversionKey,
  eventName: string,
  metadata: ConversionMetadata,
): void {
  sendGaEvent(eventName, {
    event_category: metadata.category ?? "engagement",
    event_label: metadata.label,
    apartment_id: metadata.apartmentId,
    transaction_id: metadata.transactionId,
  });

  sendGoogleAdsConversion(conversionKey, metadata);
}

/** WhatsApp CTA click — GA4 now, Google Ads conversion when configured. */
export function trackWhatsAppClick(metadata: ConversionMetadata): void {
  trackEngagementConversion("whatsapp", "whatsapp_click", metadata);
}

/** Phone / tel: link click — GA4 now, Google Ads conversion when configured. */
export function trackPhoneCallClick(metadata: ConversionMetadata): void {
  trackEngagementConversion("phone", "phone_call_click", metadata);
}

/** Contact form success — GA4 now, Google Ads conversion when configured. */
export function trackContactFormConversion(metadata: {
  label?: string;
  inquiryCategory: string;
}): void {
  sendGaEvent("inquiry_submit", {
    event_category: "inquiry",
    event_label: metadata.label ?? "Contact Form",
    inquiry_category: metadata.inquiryCategory,
  });

  sendGoogleAdsConversion("inquiry", {
    label: metadata.label ?? "Contact Form",
    category: "inquiry",
  });
}

/** Successful booking — GA4 now, Google Ads conversion when configured. */
export function trackBookingConversion(metadata: {
  reference?: string;
  label?: string;
  value?: number;
}): void {
  sendGaEvent("booking_complete", {
    event_category: "conversion",
    event_label: metadata.label ?? "Booking Success Page",
    transaction_id: metadata.reference,
    value: metadata.value,
    currency: "NGN",
  });

  sendGoogleAdsConversion("booking", {
    label: metadata.label ?? "Booking Success Page",
    category: "conversion",
    transactionId: metadata.reference,
    value: metadata.value,
    currency: "NGN",
  });
}
