import {
  getEffectiveNightlyRate,
  getStayDiscountAmount,
  getStayDiscountPerNight,
  PAYSTACK_FEE,
} from "./constants";

/**
 * Number of nights for a stay (checkout date is exclusive, same as the booking UI).
 * Uses calendar Y-M-D components so server and browser agree regardless of timezone.
 */
export function nightsBetweenStayDates(checkIn: string, checkOut: string): number {
  const [y1, m1, d1] = checkIn.split("-").map(Number);
  const [y2, m2, d2] = checkOut.split("-").map(Number);
  const inDate = new Date(y1, m1 - 1, d1);
  const outDate = new Date(y2, m2 - 1, d2);
  if (outDate <= inDate) return 0;
  return Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
}

export interface StayDiscountTier {
  label: string;
  nightsHint: string;
  effectiveNightlyRateNgn: number;
  savingsPerNightNgn: number;
}

/** Marketing table for the stay-discount promo (no dates required). */
export function getStayDiscountTiers(rackRateNgn: number): StayDiscountTier[] {
  const tiers: Array<{ label: string; nightsHint: string; nights: number }> = [
    { label: "1 night", nightsHint: "Standard rate", nights: 1 },
    { label: "2 nights", nightsHint: "Weekend escape", nights: 2 },
    { label: "3–6 nights", nightsHint: "Extended stay", nights: 4 },
    { label: "1 week – 3 weeks", nightsHint: "Weekly rate", nights: 7 },
    { label: "1 month or more", nightsHint: "Best value", nights: 28 },
  ];

  return tiers.map(({ label, nightsHint, nights }) => {
    const savingsPerNightNgn = getStayDiscountPerNight(nights);
    return {
      label,
      nightsHint,
      effectiveNightlyRateNgn: getEffectiveNightlyRate(rackRateNgn, nights),
      savingsPerNightNgn,
    };
  });
}

export interface BookingQuote {
  nights: number;
  /** Rack rate × nights (before any stay discount). */
  subtotal: number;
  discountAmount: number;
  hasDiscount: boolean;
  /** Accommodation after discount, excluding Paystack fee. */
  accommodationTotalNgn: number;
  effectiveNightlyRateNgn: number;
  totalNgn: number;
}

/** Total payable in NGN (integer) for Paystack, from rack rate and stay dates. */
export function computeBookingQuote(
  rackRateNgn: number,
  checkIn: string,
  checkOut: string
): BookingQuote | null {
  const nights = nightsBetweenStayDates(checkIn, checkOut);
  if (nights <= 0) return null;
  const subtotal = rackRateNgn * nights;
  const discountAmount = getStayDiscountAmount(nights);
  const effectiveNightlyRateNgn = getEffectiveNightlyRate(rackRateNgn, nights);
  const accommodationTotalNgn = effectiveNightlyRateNgn * nights;
  const totalNgn = accommodationTotalNgn + PAYSTACK_FEE;
  return {
    nights,
    subtotal,
    discountAmount,
    hasDiscount: discountAmount > 0,
    accommodationTotalNgn,
    effectiveNightlyRateNgn,
    totalNgn,
  };
}

/** Paystack `amount` field is in kobo (whole integer). */
export function totalNgnToKobo(totalNgn: number): number {
  return Math.round(totalNgn * 100);
}
