import type { PaystackVerifyData } from "./paystack";
import { initiateRefund } from "./paystack";
import { getApartmentById } from "./data/apartments";
import { prisma } from "./db";
import {
    computeBookingQuote,
    nightsBetweenStayDates,
    totalNgnToKobo,
} from "./pricing";
import {
    BookingDateConflictError,
    findOverlappingBooking,
    isExclusionConstraintViolation,
    withApartmentBookingTransaction,
} from "./booking/conflict";
import {
    finalizeRefundResult,
    tryClaimRefundProcessing,
} from "./booking/refund";
import { sendAdminAlertBookingConflictRefund } from "./email/admin-alerts";

export { BookingDateConflictError } from "./booking/conflict";

function parseDate(s: string): Date {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid date: " + s);
    return d;
}

function validatePaystackBookingInput(data: PaystackVerifyData) {
    if (data.status !== "success") {
        throw new Error(
            `Cannot create booking from non-successful Paystack transaction: ${data.status}`,
        );
    }

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

    return {
        meta,
        apartmentId,
        checkInStr,
        checkOutStr,
        email,
        checkIn: parseDate(checkInStr),
        checkOut: parseDate(checkOutStr),
        nights: nightsBetweenStayDates(checkInStr, checkOutStr),
        amountPaidNgn: Math.round(data.amount / 100),
    };
}

async function persistConflictAuditBooking(args: {
    data: PaystackVerifyData;
    apartmentId: string;
    checkIn: Date;
    checkOut: Date;
    nights: number;
    amountPaidNgn: number;
    email: string;
    bookerName: string | null;
    bookerPhone: string | null;
}) {
    await prisma.booking.upsert({
        where: { reference: args.data.reference },
        create: {
            reference: args.data.reference,
            apartmentId: args.apartmentId,
            checkIn: args.checkIn,
            checkOut: args.checkOut,
            nights: args.nights,
            amountPaid: args.amountPaidNgn,
            status: "CANCELLED",
            source: "WEBSITE",
            bookerEmail: args.email,
            bookerName: args.bookerName,
            bookerPhone: args.bookerPhone,
            expiresAt: null,
        },
        update: {
            status: "CANCELLED",
            expiresAt: null,
            updatedAt: new Date(),
        },
    });
}

async function handleBookingDateConflict(
    data: PaystackVerifyData,
    validated: ReturnType<typeof validatePaystackBookingInput>,
): Promise<never> {
    const auditArgs = {
        data,
        apartmentId: validated.apartmentId,
        checkIn: validated.checkIn,
        checkOut: validated.checkOut,
        nights: validated.nights,
        amountPaidNgn: validated.amountPaidNgn,
        email: validated.email,
        bookerName: validated.meta.booker_name ?? null,
        bookerPhone: validated.meta.booker_phone ?? null,
    };

    try {
        await persistConflictAuditBooking(auditArgs);
    } catch (auditErr) {
        console.error("Failed to persist conflict audit booking:", auditErr);
    }

    const claim = await tryClaimRefundProcessing(data.reference);

    if (claim.action === "already_refunded") {
        throw new BookingDateConflictError(
            "Requested dates are no longer available for this apartment",
            { refundInitiated: true },
        );
    }

    if (claim.action === "blocked") {
        throw new BookingDateConflictError(
            "Requested dates are no longer available for this apartment",
            { refundInitiated: false },
        );
    }

    const refund = await initiateRefund({
        transaction: data.reference,
        amount: data.amount,
    });

    try {
        await finalizeRefundResult({ reference: data.reference, refund });
    } catch (finalizeErr) {
        console.error("Failed to persist refund result:", finalizeErr);
    }

    await sendAdminAlertBookingConflictRefund({
        reference: data.reference,
        apartmentId: validated.apartmentId,
        checkIn: validated.checkInStr,
        checkOut: validated.checkOutStr,
        bookerEmail: validated.email,
        refundInitiated: refund.ok,
        refundMessage: refund.message,
        paystackData: data,
    });

    throw new BookingDateConflictError(
        "Requested dates are no longer available for this apartment",
        { refundInitiated: refund.ok },
    );
}

async function confirmBookingInTransaction(
    data: PaystackVerifyData,
    validated: ReturnType<typeof validatePaystackBookingInput>,
) {
    const {
        meta,
        apartmentId,
        email,
        checkIn,
        checkOut,
        nights,
        amountPaidNgn,
    } = validated;

    return withApartmentBookingTransaction(apartmentId, async (tx) => {
        const existing = await tx.booking.findUnique({
            where: { reference: data.reference },
        });

        if (existing?.status === "PAID") {
            return existing;
        }

        if (existing?.status === "PENDING") {
            const expiresAt = existing.expiresAt;
            if (expiresAt && expiresAt <= new Date()) {
                throw new BookingDateConflictError("Checkout hold expired");
            }

            const overlap = await findOverlappingBooking(tx, {
                apartmentId,
                checkIn,
                checkOut,
                excludeReference: data.reference,
            });
            if (overlap) {
                throw new BookingDateConflictError("Overlapping booking exists");
            }

            return tx.booking.update({
                where: { reference: data.reference },
                data: {
                    status: "PAID",
                    amountPaid: amountPaidNgn,
                    expiresAt: null,
                    bookerEmail: email,
                    bookerName: meta.booker_name ?? existing.bookerName,
                    bookerPhone: meta.booker_phone ?? existing.bookerPhone,
                    updatedAt: new Date(),
                },
            });
        }

        const overlap = await findOverlappingBooking(tx, {
            apartmentId,
            checkIn,
            checkOut,
            excludeReference: data.reference,
        });
        if (overlap) {
            throw new BookingDateConflictError("Overlapping booking exists");
        }

        return tx.booking.create({
            data: {
                reference: data.reference,
                apartmentId,
                checkIn,
                checkOut,
                nights,
                amountPaid: amountPaidNgn,
                status: "PAID",
                source: "WEBSITE",
                bookerEmail: email,
                bookerName: meta.booker_name ?? null,
                bookerPhone: meta.booker_phone ?? null,
                expiresAt: null,
            },
        });
    });
}

export async function upsertBookingFromPaystack(data: PaystackVerifyData) {
    const validated = validatePaystackBookingInput(data);

    try {
        return await confirmBookingInTransaction(data, validated);
    } catch (err) {
        if (
            err instanceof BookingDateConflictError ||
            isExclusionConstraintViolation(err)
        ) {
            await handleBookingDateConflict(data, validated);
        }
        throw err;
    }
}

export async function cancelBookingHold(reference: string): Promise<void> {
    await prisma.booking.updateMany({
        where: { reference, status: "PENDING" },
        data: { status: "CANCELLED", expiresAt: null },
    });
}

export function formatBookingConflictMessage(
    checkIn: Date,
    checkOut: Date,
): string {
    const conflictStart = checkIn.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
    const conflictEnd = checkOut.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
    return `This apartment is already booked from ${conflictStart} to ${conflictEnd}. Please select different dates.`;
}
