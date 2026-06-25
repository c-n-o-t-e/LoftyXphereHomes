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
    expect(computeBookingQuote(250_000, "2026-03-24", "2026-03-20")).toBeNull();
    expect(computeBookingQuote(250_000, "2026-03-20", "2026-03-20")).toBeNull();
  });

  it("applies 2-bedroom tiered rates for a 4-night stay", () => {
    const rack = 250_000;
    const nights = 4;
    const quote = computeBookingQuote(rack, "2026-03-20", "2026-03-24");
    expect(quote).not.toBeNull();
    if (!quote) return;

    expect(quote.nights).toBe(nights);
    expect(quote.subtotal).toBe(rack * nights);
    expect(quote.discountAmount).toBe(20_000 * nights);
    expect(quote.effectiveNightlyRateNgn).toBe(230_000);
    expect(quote.accommodationTotalNgn).toBe(230_000 * nights);
    expect(quote.totalNgn).toBe(quote.accommodationTotalNgn + PAYSTACK_FEE);
  });

  it("matches stay discount + Paystack fee in total", () => {
    const quote = computeBookingQuote(250_000, "2026-03-20", "2026-03-24");
    expect(quote).not.toBeNull();
    if (!quote) return;
    expect(quote.totalNgn).toBe(
      quote.subtotal - quote.discountAmount + PAYSTACK_FEE,
    );
  });

  it("exposes marketing tiers from rack rate", () => {
    const tiers = getStayDiscountTiers(250_000);
    expect(tiers[0]?.effectiveNightlyRateNgn).toBe(250_000);
    expect(tiers[1]?.effectiveNightlyRateNgn).toBe(240_000);
    expect(tiers[2]?.effectiveNightlyRateNgn).toBe(230_000);
    expect(tiers[3]?.effectiveNightlyRateNgn).toBe(220_000);
    expect(tiers[4]?.effectiveNightlyRateNgn).toBe(210_000);
  });
});

describe("stay discount tiers", () => {
  it("returns zero discount for a single night", () => {
    expect(getStayDiscountPerNight(1)).toBe(0);
    expect(getEffectiveNightlyRate(250_000, 1)).toBe(250_000);
  });

  it("returns ₦10k/night off for 2-night stays", () => {
    expect(getStayDiscountPerNight(2)).toBe(10_000);
    expect(getEffectiveNightlyRate(250_000, 2)).toBe(240_000);
  });

  it("returns ₦20k/night off for 3–6 nights", () => {
    expect(getStayDiscountPerNight(4)).toBe(20_000);
    expect(getStayDiscountAmount(4)).toBe(80_000);
  });

  it("returns ₦30k/night off for 7–21 nights", () => {
    expect(getStayDiscountPerNight(14)).toBe(30_000);
  });

  it("returns ₦40k/night off for 28+ nights", () => {
    expect(getStayDiscountPerNight(30)).toBe(40_000);
    expect(getEffectiveNightlyRate(250_000, 30)).toBe(210_000);
  });
});
