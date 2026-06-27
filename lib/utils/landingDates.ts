import { areDatesValid } from "./search";

export const LANDING_DEFAULT_NIGHTS = 2;

/** Format a local calendar date as YYYY-MM-DD (timezone-safe for UI). */
export function formatDateIsoLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Default landing stay: check-in today, check-out after LANDING_DEFAULT_NIGHTS. */
export function getDefaultLandingDates(referenceDate = new Date()): {
  checkIn: string;
  checkOut: string;
} {
  const checkIn = new Date(referenceDate);
  checkIn.setHours(0, 0, 0, 0);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkOut.getDate() + LANDING_DEFAULT_NIGHTS);
  return {
    checkIn: formatDateIsoLocal(checkIn),
    checkOut: formatDateIsoLocal(checkOut),
  };
}

export function parseLandingDatesFromParams(
  checkIn?: string | null,
  checkOut?: string | null,
  referenceDate = new Date(),
): { checkIn: string; checkOut: string; usedDefaults: boolean } {
  if (checkIn && checkOut && areDatesValid(checkIn, checkOut)) {
    return { checkIn, checkOut, usedDefaults: false };
  }
  const defaults = getDefaultLandingDates(referenceDate);
  return { ...defaults, usedDefaults: true };
}

export function buildBookingSearchParams(params: {
  checkIn: string;
  checkOut: string;
  guests?: number;
}): string {
  const sp = new URLSearchParams();
  sp.set("checkIn", params.checkIn);
  sp.set("checkOut", params.checkOut);
  if (params.guests && params.guests > 0) {
    sp.set("guests", String(params.guests));
  }
  return sp.toString();
}

const UTM_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

/** Copy UTM params from current search params into a new URLSearchParams. */
export function appendUtmParams(
  target: URLSearchParams,
  source: URLSearchParams,
): void {
  for (const key of UTM_PARAM_KEYS) {
    const value = source.get(key);
    if (value) target.set(key, value);
  }
}

export function extractUtmParams(
  searchParams: URLSearchParams,
): Record<string, string> {
  const utm: Record<string, string> = {};
  for (const key of UTM_PARAM_KEYS) {
    const value = searchParams.get(key);
    if (value) utm[key] = value;
  }
  return utm;
}
