export const CONSENT_REQUIRED_COOKIE = "lxh-consent-required";
export const ANALYTICS_CONSENT_COOKIE = "lxh-analytics-consent";
export const ANALYTICS_CONSENT_STORAGE_KEY = "lxh-analytics-consent";

export type AnalyticsConsentValue = "granted" | "denied";
export type AnalyticsConsentStatus = AnalyticsConsentValue | "pending";

export type CookieConsentMode = "eea" | "always" | "off";

export function getCookieConsentMode(): CookieConsentMode {
  const mode = process.env.NEXT_PUBLIC_COOKIE_CONSENT_MODE?.trim().toLowerCase();
  if (mode === "always" || mode === "off") return mode;
  return "eea";
}

export function isCookieConsentFeatureEnabled(): boolean {
  return getCookieConsentMode() !== "off";
}

export function parseAnalyticsConsent(
  value?: string | null,
): AnalyticsConsentStatus {
  if (value === "granted" || value === "denied") return value;
  return "pending";
}

export function consentRequiresBanner(
  consentRequired: boolean,
  consent: AnalyticsConsentStatus,
): boolean {
  return consentRequired && consent === "pending";
}

export function isAnalyticsAllowedByConsent(
  consentRequired: boolean,
  consent: AnalyticsConsentStatus,
): boolean {
  if (!consentRequired) return true;
  return consent === "granted";
}

export function readClientAnalyticsConsent(): AnalyticsConsentStatus {
  if (typeof window === "undefined") return "pending";

  const fromStorage = window.localStorage.getItem(ANALYTICS_CONSENT_STORAGE_KEY);
  if (fromStorage === "granted" || fromStorage === "denied") {
    return fromStorage;
  }

  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`))
    ?.split("=")[1];

  return parseAnalyticsConsent(cookieValue);
}

export function readClientConsentRequired(): boolean {
  if (typeof window === "undefined") return false;

  return (
    document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${CONSENT_REQUIRED_COOKIE}=`))
      ?.split("=")[1] === "1"
  );
}

export function persistAnalyticsConsent(value: AnalyticsConsentValue): void {
  if (typeof window === "undefined") return;

  const maxAgeSeconds = 60 * 60 * 24 * 365;
  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
  window.localStorage.setItem(ANALYTICS_CONSENT_STORAGE_KEY, value);
}

export function clearAnalyticsConsent(): void {
  if (typeof window === "undefined") return;

  document.cookie = `${ANALYTICS_CONSENT_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  window.localStorage.removeItem(ANALYTICS_CONSENT_STORAGE_KEY);
}
