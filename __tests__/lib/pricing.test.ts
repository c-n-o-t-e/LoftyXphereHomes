import { computeBookingQuote, nightsBetweenStayDates } from "@/lib/pricing";
import { PAYSTACK_FEE } from "@/lib/constants";

describe("pricing", () => {
  it("computes nights between calendar dates", () => {
    expect(nightsBetweenStayDates("2026-03-20", "2026-03-24")).toBe(4);
    expect(nightsBetweenStayDates("2026-03-20", "2026-03-21")).toBe(1);
  });

  it("returns null for invalid ranges", () => {
    expect(computeBookingQuote(50_000, "2026-03-24", "2026-03-20")).toBeNull();
    expect(computeBookingQuote(50_000, "2026-03-20", "2026-03-20")).toBeNull();
  });

  it("matches stay discount + Paystack fee in total", () => {
    const pricePerNight = 50_000;
    const nights = 4;
    const checkIn = "2026-03-20";
    const checkOut = "2026-03-24";
    const quote = computeBookingQuote(pricePerNight, checkIn, checkOut);
    expect(quote).not.toBeNull();
    if (!quote) return;
    expect(quote.nights).toBe(nights);
    expect(quote.subtotal).toBe(pricePerNight * nights);
    expect(quote.totalNgn).toBe(quote.subtotal - quote.discountAmount + PAYSTACK_FEE);
  });
});
