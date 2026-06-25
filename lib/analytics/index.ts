export {
  getGaMeasurementId,
  getGoogleAdsConversionId,
  isGaConfigured,
  isGoogleAdsConfigured,
} from "@/lib/analytics/config";
export { pageview, sendGaEvent } from "@/lib/analytics/gtag";
export {
  trackEvent,
  trackApartmentView,
  trackApartmentGalleryOpen,
  trackApartmentImageInteraction,
  trackInquirySubmit,
  trackBookingComplete,
} from "@/lib/analytics/events";
export type { AnalyticsEventParams, AnalyticsEventCategory } from "@/lib/analytics/events";
export {
  trackWhatsAppClick,
  trackPhoneCallClick,
  trackContactFormConversion,
  trackBookingConversion,
  sendGoogleAdsConversion,
  GOOGLE_ADS_CONVERSION_LABELS,
} from "@/lib/analytics/conversions";
export type {
  ConversionMetadata,
  GoogleAdsConversionKey,
} from "@/lib/analytics/conversions";
