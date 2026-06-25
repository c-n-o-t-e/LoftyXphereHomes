import { getApartmentById } from "@/lib/data/apartments";
import { computeBookingQuote, totalNgnToKobo } from "@/lib/pricing";
import type { PaystackVerifyData, PaystackVerifyResponse } from "@/lib/paystack";

/** Reference shape: e2e:<apartmentId>:<checkIn>:<checkOut> */
const E2E_REFERENCE_PREFIX = "e2e:";

export type E2ePaystackBookingPayload = {
    apartmentId: string;
    checkIn: string;
    checkOut: string;
};

export function isE2ePaystackMockEnabled(): boolean {
    return process.env.E2E_MOCK_PAYSTACK === "true";
}

export function buildE2ePaystackReference(
    payload: E2ePaystackBookingPayload,
): string {
    return `${E2E_REFERENCE_PREFIX}${payload.apartmentId}:${payload.checkIn}:${payload.checkOut}`;
}

export function parseE2ePaystackReference(
    reference: string,
): E2ePaystackBookingPayload | null {
    if (!reference.startsWith(E2E_REFERENCE_PREFIX)) return null;

    const body = reference.slice(E2E_REFERENCE_PREFIX.length);
    const lastColon = body.lastIndexOf(":");
    const secondLastColon = body.lastIndexOf(":", lastColon - 1);
    if (lastColon <= 0 || secondLastColon <= 0) return null;

    const apartmentId = body.slice(0, secondLastColon);
    const checkIn = body.slice(secondLastColon + 1, lastColon);
    const checkOut = body.slice(lastColon + 1);

    if (!apartmentId || !checkIn || !checkOut) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn)) return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return null;

    return { apartmentId, checkIn, checkOut };
}

export function buildE2ePaystackVerifyResponse(
    reference: string,
): PaystackVerifyResponse | null {
    const payload = parseE2ePaystackReference(reference);
    if (!payload) return null;

    const apartment = getApartmentById(payload.apartmentId);
    if (!apartment) return null;

    const quote = computeBookingQuote(
        apartment.pricePerNight,
        payload.checkIn,
        payload.checkOut,
    );
    if (!quote) return null;

    const data: PaystackVerifyData = {
        reference,
        status: "success",
        amount: totalNgnToKobo(quote.totalNgn),
        metadata: {
            apartment_id: payload.apartmentId,
            check_in: payload.checkIn,
            check_out: payload.checkOut,
            booker_name: "E2E Guest",
            booker_phone: "+2348000000000",
        },
        customer: { email: "e2e-guest@example.com" },
    };

    return { status: true, data };
}
