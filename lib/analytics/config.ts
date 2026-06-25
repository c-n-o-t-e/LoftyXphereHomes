/** Reads GA4 measurement ID from env at call time (never hardcode). */
export function getGaMeasurementId(): string {
  return process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
}

export function isGaConfigured(): boolean {
  return getGaMeasurementId().length > 0;
}

/** Reserved for future Google Ads conversion tags (not wired yet). */
export function getGoogleAdsConversionId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID?.trim() ?? "";
}

export function isGoogleAdsConfigured(): boolean {
  return getGoogleAdsConversionId().length > 0;
}
