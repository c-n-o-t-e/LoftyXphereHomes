import type { PaystackVerifyData } from "./paystack";
import { prisma } from "./db";

function parseDate(s: string): Date {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid date: " + s);
    return d;
}

function nightsBetween(checkIn: Date, checkOut: Date): number {
    const ms = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
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

    const checkIn = parseDate(checkInStr);
    const checkOut = parseDate(checkOutStr);
    const nights = nightsBetween(checkIn, checkOut);
    const amountPaidNgn = Math.round(data.amount / 100); // kobo -> NGN
    const status = data.status === "success" ? "PAID" : "PENDING";

    return prisma.booking.upsert({
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
}
