import type { PaystackVerifyData } from "./paystack";
import { getApartmentById } from "./data/apartments";
import { prisma } from "./db";
import {
    computeBookingQuote,
    nightsBetweenStayDates,
    totalNgnToKobo,
} from "./pricing";

function parseDate(s: string): Date {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid date: " + s);
    return d;
}

export async function upsertBookingFromPaystack(data: PaystackVerifyData) {
    const meta = data.metadata ?? {};
    const apartmentId = meta.apartment_id;
    const checkInStr = meta.check_in;
    const checkOutStr = meta.check_out;
    const email = data.customer?.email?.trim();

    if (!apartmentId || !checkInStr || !checkOutStr || !email) {
        throw new Error(
            "Missing apartment_id, check_in, check_out, or customer email",
        );
    }

    const apartment = getApartmentById(apartmentId);
    if (!apartment) {
        throw new Error("Unknown apartment: " + apartmentId);
    }

    const quote = computeBookingQuote(
        apartment.pricePerNight,
        checkInStr,
        checkOutStr,
    );
    if (!quote) {
        throw new Error("Invalid stay dates for booking");
    }

    const expectedKobo = totalNgnToKobo(quote.totalNgn);
    if (data.amount !== expectedKobo) {
        throw new Error(
            `Payment amount does not match server price (expected ${expectedKobo} kobo, received ${data.amount})`,
        );
    }

    const checkIn = parseDate(checkInStr);
    const checkOut = parseDate(checkOutStr);
    const nights = nightsBetweenStayDates(checkInStr, checkOutStr);
    const amountPaidNgn = Math.round(data.amount / 100); // kobo -> NGN
    const status = data.status === "success" ? "PAID" : "PENDING";

    const booking = await prisma.booking.upsert({
        where: { reference: data.reference },
        create: {
            reference: data.reference,
            apartmentId,
            checkIn,
            checkOut,
            nights,
            amountPaid: amountPaidNgn,
            status,
            bookerEmail: email,
            bookerName: meta.booker_name ?? null,
            bookerPhone: meta.booker_phone ?? null,
        },
        update: {
            status,
            amountPaid: amountPaidNgn,
            updatedAt: new Date(),
        },
    });

    return booking;
}
