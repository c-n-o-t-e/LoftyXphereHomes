export const CHECK_IN_TIME = "2:00 PM";
export const CHECK_OUT_TIME = "11:00 AM";

/**
 * Length-of-stay discounts: NGN off the daily rate, per night.
 * 3–6 nights: ₦10,000/night | 7–21 nights: ₦20,000/night | 28+ nights: ₦30,000/night
 */
export const DISCOUNT_PER_NIGHT_3_6 = 10_000;   // 3–6 nights
export const DISCOUNT_PER_NIGHT_1_WEEK_TO_3_WEEKS = 20_000; // 7–21 nights
export const DISCOUNT_PER_NIGHT_1_MONTH_PLUS = 30_000;      // 28+ nights

/** Returns discount per night in NGN for a given stay length (0 if under 3 nights). */
export function getStayDiscountPerNight(nights: number): number {
  if (nights < 3) return 0;
  if (nights <= 6) return DISCOUNT_PER_NIGHT_3_6;
  if (nights <= 21) return DISCOUNT_PER_NIGHT_1_WEEK_TO_3_WEEKS;
  return DISCOUNT_PER_NIGHT_1_MONTH_PLUS;
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

