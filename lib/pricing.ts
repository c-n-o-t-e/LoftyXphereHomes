import { getStayDiscountAmount, PAYSTACK_FEE } from "./constants";

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

export interface BookingQuote {
  nights: number;
  subtotal: number;
  discountAmount: number;
  hasDiscount: boolean;
  totalNgn: number;
}

/** Total payable in NGN (integer) for Paystack, from catalog price and stay dates. */
export function computeBookingQuote(
  pricePerNight: number,
  checkIn: string,
  checkOut: string
): BookingQuote | null {
  const nights = nightsBetweenStayDates(checkIn, checkOut);
  if (nights <= 0) return null;
  const subtotal = pricePerNight * nights;
  const discountAmount = getStayDiscountAmount(nights);
  const afterDiscount = subtotal - discountAmount;
  const totalNgn = afterDiscount + PAYSTACK_FEE;
  return {
    nights,
    subtotal,
    discountAmount,
    hasDiscount: discountAmount > 0,
    totalNgn,
  };
}

/** Paystack `amount` field is in kobo (whole integer). */
export function totalNgnToKobo(totalNgn: number): number {
  return Math.round(totalNgn * 100);
}
