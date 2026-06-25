import { PAYSTACK_FEE } from "@/lib/constants";
import { getApartmentById } from "@/lib/data/apartments";
import { computeBookingQuote } from "@/lib/pricing";

export type InvoiceFinancials = {
    /** Rack rate × nights (before stay discount). */
    subtotalNgn: number;
    /** Total length-of-stay discount (rack subtotal − accommodation). */
    discountNgn: number;
    /** Accommodation after discount — excludes Paystack fee. */
    accommodationNgn: number;
    /** What the guest actually paid (includes processing fee when applicable). */
    amountPaidNgn: number;
    /** Payment processing fee when known (0 for manual/legacy bookings). */
    processingFeeNgn: number;
    /** Rack subtotal shown on the accommodation line item. */
    lineItemNgn: number;
    /** Rack nightly rate for display, when known. */
    rackRateNgn?: number;
    nights?: number;
};

export function formatNgnAmount(amountNgn: number): string {
    if (!Number.isFinite(amountNgn)) return "0";
    return Math.round(amountNgn).toLocaleString("en-NG");
}

/**
 * Derive invoice line amounts from catalog pricing when they match amount paid.
 * Manual or legacy bookings fall back to a single total with no discount row.
 */
export function resolveInvoiceFinancials(args: {
    apartmentId: string;
    checkIn: string;
    checkOut: string;
    amountPaidNgn: number;
}): InvoiceFinancials {
    const amountPaidNgn = Math.round(args.amountPaidNgn);
    const apartment = getApartmentById(args.apartmentId);
    const quote = apartment
        ? computeBookingQuote(
              apartment.pricePerNight,
              args.checkIn,
              args.checkOut,
          )
        : null;

    if (quote && quote.totalNgn === amountPaidNgn) {
        return {
            subtotalNgn: quote.subtotal,
            discountNgn: quote.discountAmount,
            accommodationNgn: quote.accommodationTotalNgn,
            amountPaidNgn,
            processingFeeNgn: PAYSTACK_FEE,
            lineItemNgn: quote.subtotal,
            rackRateNgn: apartment?.pricePerNight,
            nights: quote.nights,
        };
    }

    return {
        subtotalNgn: amountPaidNgn,
        discountNgn: 0,
        accommodationNgn: amountPaidNgn,
        amountPaidNgn,
        processingFeeNgn: 0,
        lineItemNgn: amountPaidNgn,
    };
}
