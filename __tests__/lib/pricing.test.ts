import { computeBookingQuote, getStayDiscountTiers, nightsBetweenStayDates } from "@/lib/pricing";
import {
  PAYSTACK_FEE,
  getEffectiveNightlyRate,
  getStayDiscountAmount,
  getStayDiscountPerNight,
} from "@/lib/constants";

describe("pricing", () => {
  it("computes nights between calendar dates", () => {
    expect(nightsBetweenStayDates("2026-03-20", "2026-03-24")).toBe(4);
    expect(nightsBetweenStayDates("2026-03-20", "2026-03-21")).toBe(1);
  });

  it("returns null for invalid ranges", () => {
    expect(computeBookingQuote(200_000, "2026-03-24", "2026-03-20")).toBeNull();
    expect(computeBookingQuote(200_000, "2026-03-20", "2026-03-20")).toBeNull();
  });

  it("applies unified tiered rates for a 4-night 2-bedroom stay", () => {
    const rack = 200_000;
    const nights = 4;
    const quote = computeBookingQuote(rack, "2026-03-20", "2026-03-24");
    expect(quote).not.toBeNull();
    if (!quote) return;

    expect(quote.nights).toBe(nights);
    expect(quote.subtotal).toBe(rack * nights);
    expect(quote.discountAmount).toBe(10_000 * nights);
    expect(quote.effectiveNightlyRateNgn).toBe(190_000);
    expect(quote.accommodationTotalNgn).toBe(190_000 * nights);
    expect(quote.totalNgn).toBe(quote.accommodationTotalNgn + PAYSTACK_FEE);
  });

  it("applies unified tiered rates for a 4-night 1-bedroom stay", () => {
    const rack = 100_000;
    const nights = 4;
    const quote = computeBookingQuote(rack, "2026-03-20", "2026-03-24");
    expect(quote).not.toBeNull();
    if (!quote) return;

    expect(quote.nights).toBe(nights);
    expect(quote.discountAmount).toBe(10_000 * nights);
    expect(quote.effectiveNightlyRateNgn).toBe(90_000);
    expect(quote.accommodationTotalNgn).toBe(90_000 * nights);
  });

  it("matches stay discount + Paystack fee in total", () => {
    const quote = computeBookingQuote(200_000, "2026-03-20", "2026-03-24");
    expect(quote).not.toBeNull();
    if (!quote) return;
    expect(quote.totalNgn).toBe(
      quote.subtotal - quote.discountAmount + PAYSTACK_FEE,
    );
  });

  it("exposes two-bedroom marketing tiers from rack rate", () => {
    const tiers = getStayDiscountTiers(200_000);
    expect(tiers[0]?.effectiveNightlyRateNgn).toBe(200_000);
    expect(tiers[1]?.effectiveNightlyRateNgn).toBe(195_000);
    expect(tiers[2]?.effectiveNightlyRateNgn).toBe(190_000);
    expect(tiers[3]?.effectiveNightlyRateNgn).toBe(185_000);
    expect(tiers[4]?.effectiveNightlyRateNgn).toBe(180_000);
  });

  it("exposes one-bedroom marketing tiers from rack rate", () => {
    const tiers = getStayDiscountTiers(100_000);
    expect(tiers[0]?.effectiveNightlyRateNgn).toBe(100_000);
    expect(tiers[1]?.effectiveNightlyRateNgn).toBe(95_000);
    expect(tiers[2]?.effectiveNightlyRateNgn).toBe(90_000);
    expect(tiers[3]?.effectiveNightlyRateNgn).toBe(85_000);
    expect(tiers[4]?.effectiveNightlyRateNgn).toBe(80_000);
  });
});

describe("stay discount tiers", () => {
  it("returns zero discount for a single night", () => {
    expect(getStayDiscountPerNight(1)).toBe(0);
    expect(getEffectiveNightlyRate(200_000, 1)).toBe(200_000);
    expect(getEffectiveNightlyRate(100_000, 1)).toBe(100_000);
  });

  it("returns ₦5k/night off for 2-night stays", () => {
    expect(getStayDiscountPerNight(2)).toBe(5_000);
    expect(getEffectiveNightlyRate(200_000, 2)).toBe(195_000);
    expect(getEffectiveNightlyRate(100_000, 2)).toBe(95_000);
  });

  it("returns ₦10k/night off for 3–6 nights", () => {
    expect(getStayDiscountPerNight(4)).toBe(10_000);
    expect(getStayDiscountAmount(4)).toBe(40_000);
    expect(getEffectiveNightlyRate(200_000, 4)).toBe(190_000);
    expect(getEffectiveNightlyRate(100_000, 4)).toBe(90_000);
  });

  it("returns ₦15k/night off for 7–21 nights", () => {
    expect(getStayDiscountPerNight(14)).toBe(15_000);
    expect(getEffectiveNightlyRate(200_000, 14)).toBe(185_000);
    expect(getEffectiveNightlyRate(100_000, 14)).toBe(85_000);
  });

  it("returns ₦20k/night off for 28+ nights", () => {
    expect(getStayDiscountPerNight(30)).toBe(20_000);
    expect(getEffectiveNightlyRate(200_000, 30)).toBe(180_000);
    expect(getEffectiveNightlyRate(100_000, 30)).toBe(80_000);
  });
});
