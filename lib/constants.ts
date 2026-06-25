export const CHECK_IN_TIME = "2:00 PM";
export const CHECK_OUT_TIME = "11:00 AM";

/** Rack rates (full single-night price before length-of-stay reductions). */
export const ONE_BED_RACK_RATE_NGN = 120_000;
export const TWO_BED_RACK_RATE_NGN = 250_000;

/**
 * Length-of-stay savings off the rack nightly rate (same absolute amounts for all units).
 * Effective nightly rate = rack rate − discount per night for the whole stay tier.
 *
 * 1 night: full rack | 2 nights: −₦10k/night | 3–6: −₦20k | 7–21: −₦30k | 28+: −₦40k
 */
export const DISCOUNT_PER_NIGHT_2_NIGHTS = 10_000;
export const DISCOUNT_PER_NIGHT_3_6 = 20_000;
export const DISCOUNT_PER_NIGHT_1_WEEK_TO_3_WEEKS = 30_000;
export const DISCOUNT_PER_NIGHT_1_MONTH_PLUS = 40_000;

/** Per-night discount (NGN) for a stay of `nights` length. */
export function getStayDiscountPerNight(nights: number): number {
  if (nights <= 1) return 0;
  if (nights === 2) return DISCOUNT_PER_NIGHT_2_NIGHTS;
  if (nights <= 6) return DISCOUNT_PER_NIGHT_3_6;
  if (nights <= 21) return DISCOUNT_PER_NIGHT_1_WEEK_TO_3_WEEKS;
  return DISCOUNT_PER_NIGHT_1_MONTH_PLUS;
}

/** Effective nightly rate after length-of-stay discount. */
export function getEffectiveNightlyRate(rackRateNgn: number, nights: number): number {
  return Math.max(0, rackRateNgn - getStayDiscountPerNight(nights));
}

/** Total stay discount in NGN (discount per night × nights). */
export function getStayDiscountAmount(nights: number): number {
  return getStayDiscountPerNight(nights) * nights;
}

/** Fixed Paystack processing fee in NGN. */
export const PAYSTACK_FEE = 1250;

export const STANDARD_AMENITIES = [
  "24/7 Power",
  "High-speed Wi-Fi",
  "Air Conditioning",
  "Fully equipped kitchen",
  "Secure parking",
  "Workspace desk",
  "Netflix/YouTube enabled TV",
  "Security personnel",
  "Fresh towels & toiletries",
];

export const STANDARD_HOUSE_RULES = [
  "No smoking indoors",
  "No parties without approval",
  "Valid ID required",
  "Respect neighbors (noise control after 10PM)",
];

export const SITE_NAME = "LoftyXphereHomes";
export const SITE_DESCRIPTION = "Premium shortlet apartment rentals in Nigeria. Experience luxury, comfort, and exceptional service.";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://loftyxpherehomes.com";

/** Public website shown on guest-facing invoices (never localhost). */
export const INVOICE_WEBSITE_DISPLAY = "loftyxpherehomes.com";
export const INVOICE_CURRENCY_CODE = "NGN";

/** Pre-filled message when visitors tap the site-wide WhatsApp button. */
export const WHATSAPP_DEFAULT_MESSAGE =
  "Hello, I'm interested in booking your apartment.";

/**
 * Strips to digits and, for common Nigerian local mobile format (0 + 10 digits),
 * converts to international (234 + national number) so wa.me works reliably.
 */
export function normalizeWhatsAppPhoneDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("234")) {
    return digits;
  }
  // Nigerian local mobile: 070/080/081/090/091… (11 digits including leading 0)
  if (digits.length === 11 && digits.startsWith("0") && /^0[1-9]/.test(digits)) {
    return `234${digits.slice(1)}`;
  }
  return digits;
}

/**
 * Builds a wa.me link. `phone` may include spaces or +; only digits are used
 * (with Nigerian 0-prefixed numbers normalized to 234…).
 * @returns null if there are no digits (invalid / missing number).
 */
export function getWhatsAppChatUrl(
  phone: string,
  message: string = WHATSAPP_DEFAULT_MESSAGE
): string | null {
  const digits = normalizeWhatsAppPhoneDigits(phone);
  if (!digits) return null;
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}?text=${text}`;
}
