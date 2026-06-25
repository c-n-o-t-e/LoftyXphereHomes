import { PAYSTACK_FEE } from "@/lib/constants";
import { resolveInvoiceFinancials, formatNgnAmount } from "@/lib/ops/invoiceAmounts";

describe("formatNgnAmount", () => {
    it("formats integers with en-NG grouping", () => {
        expect(formatNgnAmount(91250)).toMatch(/91,250|91250/);
    });
});

describe("resolveInvoiceFinancials", () => {
    it("uses rack subtotal, discount, and accommodation excluding Paystack fee", () => {
        const checkIn = "2026-05-12";
        const checkOut = "2026-05-16"; // 4 nights → ₦20k off/night on 2-bed rack
        const subtotal = 250_000 * 4;
        const discount = 20_000 * 4;
        const accommodation = subtotal - discount;
        const total = accommodation + PAYSTACK_FEE;

        const result = resolveInvoiceFinancials({
            apartmentId: "lofty-skyline-suite",
            checkIn,
            checkOut,
            amountPaidNgn: total,
        });

        expect(result.subtotalNgn).toBe(subtotal);
        expect(result.discountNgn).toBe(discount);
        expect(result.accommodationNgn).toBe(accommodation);
        expect(result.amountPaidNgn).toBe(total);
        expect(result.processingFeeNgn).toBe(PAYSTACK_FEE);
        expect(result.lineItemNgn).toBe(subtotal);
        expect(result.rackRateNgn).toBe(250_000);
        expect(result.nights).toBe(4);
    });

    it("includes stay discount for 7-night one-bedroom booking", () => {
        const checkIn = "2026-06-01";
        const checkOut = "2026-06-08";
        const subtotal = 120_000 * 7;
        const discount = 30_000 * 7;
        const accommodation = subtotal - discount;
        const total = accommodation + PAYSTACK_FEE;

        const result = resolveInvoiceFinancials({
            apartmentId: "lofty-horizon-suite",
            checkIn,
            checkOut,
            amountPaidNgn: total,
        });

        expect(result.subtotalNgn).toBe(subtotal);
        expect(result.discountNgn).toBe(discount);
        expect(result.accommodationNgn).toBe(accommodation);
    });

    it("falls back when paid amount does not match catalog quote (manual booking)", () => {
        const result = resolveInvoiceFinancials({
            apartmentId: "lofty-skyline-suite",
            checkIn: "2026-05-12",
            checkOut: "2026-05-14",
            amountPaidNgn: 91_250,
        });

        expect(result.subtotalNgn).toBe(91_250);
        expect(result.discountNgn).toBe(0);
        expect(result.accommodationNgn).toBe(91_250);
        expect(result.processingFeeNgn).toBe(0);
    });
});
