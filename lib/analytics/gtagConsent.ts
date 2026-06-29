export type GtagConsentSignal = "granted" | "denied";

export type GtagConsentState = {
  analytics_storage: GtagConsentSignal;
  ad_storage: GtagConsentSignal;
  ad_user_data: GtagConsentSignal;
  ad_personalization: GtagConsentSignal;
};

/** Maps site consent flags to Google Consent Mode v2 signals for gtag. */
export function buildGtagConsentState(
  analyticsEnabled: boolean,
  marketingEnabled: boolean,
): GtagConsentState {
  return {
    analytics_storage: analyticsEnabled ? "granted" : "denied",
    ad_storage: marketingEnabled ? "granted" : "denied",
    ad_user_data: marketingEnabled ? "granted" : "denied",
    ad_personalization: marketingEnabled ? "granted" : "denied",
  };
}
