export {
  getGaMeasurementId,
  getGoogleAdsConversionId,
  isGaConfigured,
  isGoogleAdsConfigured,
} from "@/lib/analytics/config";
export {
  ANALYTICS_EXCLUDED_PATH_PREFIXES,
  isAnalyticsExcludedPath,
  isAnalyticsAllowedPath,
} from "@/lib/analytics/paths";
export {
  CONSENT_REQUIRED_COOKIE,
  ANALYTICS_CONSENT_COOKIE,
  getCookieConsentMode,
  isCookieConsentFeatureEnabled,
  parseAnalyticsConsent,
  consentRequiresBanner,
  isAnalyticsAllowedByConsent,
} from "@/lib/analytics/consent";
export { isEeaOrUkCountry, EEA_UK_COUNTRY_CODES } from "@/lib/analytics/regions";
export {
  INTERNAL_TRAFFIC_COOKIE,
  INTERNAL_OPTOUT_QUERY_PARAM,
  isInternalTrafficOptedOut,
  readClientInternalTrafficOptedOut,
} from "@/lib/analytics/internal";
export { pageview, sendGaEvent } from "@/lib/analytics/gtag";
export {
  trackEvent,
  trackApartmentView,
  trackApartmentGalleryOpen,
  trackApartmentImageInteraction,
  trackInquirySubmit,
  trackBookingComplete,
  trackLandingPageView,
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
