import type { VerifiedPayment } from "@/lib/payments/types";
import { getPaymentProvider } from "@/lib/payments";
import { getApartmentById, normalizeApartmentId } from "./data/apartments";
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
import {
    resolveBookerEmail,
} from "./booking/email";
import {
    sendAdminAlertBookingConflictRefund,
} from "./email/admin-alerts";
import type { PaystackVerifyData } from "./paystack";
import { paymentProviderIdToDb } from "./payments";

export { BookingDateConflictError } from "./booking/conflict";

function parseDate(s: string): Date {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) throw new Error("Invalid date: " + s);
    return d;
}

function validateVerifiedPaymentInput(payment: VerifiedPayment) {
    if (payment.status !== "success") {
        throw new Error(
            `Cannot create booking from non-successful payment: ${payment.status}`,
        );
    }

    const meta = payment.metadata;
    const apartmentId = normalizeApartmentId(String(meta.apartment_id));
    const checkInStr = meta.check_in;
    const checkOutStr = meta.check_out;

    if (!apartmentId || !checkInStr || !checkOutStr) {
        throw new Error(
            "Missing apartment_id, check_in, or check_out",
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
    if (payment.amountMinor !== expectedKobo) {
        throw new Error(
            `Payment amount does not match server price (expected ${expectedKobo} kobo, received ${payment.amountMinor})`,
        );
    }

    return {
        meta,
        apartmentId,
        checkInStr,
        checkOutStr,
        checkIn: parseDate(checkInStr),
        checkOut: parseDate(checkOutStr),
        nights: nightsBetweenStayDates(checkInStr, checkOutStr),
        amountPaidNgn: Math.round(payment.amountMinor / 100),
    };
}

async function persistConflictAuditBooking(args: {
    payment: VerifiedPayment;
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
        where: { reference: args.payment.reference },
        create: {
            reference: args.payment.reference,
            apartmentId: args.apartmentId,
            checkIn: args.checkIn,
            checkOut: args.checkOut,
            nights: args.nights,
            amountPaid: args.amountPaidNgn,
            status: "CANCELLED",
            source: "WEBSITE",
            paymentProvider: paymentProviderIdToDb(args.payment.provider),
            providerTransactionId: args.payment.providerTransactionId ?? null,
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
    payment: VerifiedPayment,
    validated: ReturnType<typeof validateVerifiedPaymentInput>,
    bookerEmail: string,
): Promise<never> {
    const auditArgs = {
        payment,
        apartmentId: validated.apartmentId,
        checkIn: validated.checkIn,
        checkOut: validated.checkOut,
        nights: validated.nights,
        amountPaidNgn: validated.amountPaidNgn,
        email: bookerEmail,
        bookerName: validated.meta.booker_name ?? null,
        bookerPhone: validated.meta.booker_phone ?? null,
    };

    try {
        await persistConflictAuditBooking(auditArgs);
    } catch (auditErr) {
        console.error("Failed to persist conflict audit booking:", auditErr);
    }

    const claim = await tryClaimRefundProcessing(payment.reference);

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

    const provider = getPaymentProvider(payment.provider);
    const refund = await provider.initiateRefund({
        reference: payment.reference,
        amountMinor: payment.amountMinor,
        providerTransactionId: payment.providerTransactionId,
    });

    try {
        await finalizeRefundResult({ reference: payment.reference, refund });
    } catch (finalizeErr) {
        console.error("Failed to persist refund result:", finalizeErr);
    }

    await sendAdminAlertBookingConflictRefund({
        reference: payment.reference,
        apartmentId: validated.apartmentId,
        checkIn: validated.checkInStr,
        checkOut: validated.checkOutStr,
        bookerEmail,
        refundInitiated: refund.ok,
        refundMessage: refund.message,
        paymentProvider: payment.provider,
        verifiedPayment: payment,
    });

    throw new BookingDateConflictError(
        "Requested dates are no longer available for this apartment",
        { refundInitiated: refund.ok },
    );
}

async function confirmBookingInTransaction(
    payment: VerifiedPayment,
    validated: ReturnType<typeof validateVerifiedPaymentInput>,
    bookerEmail: string,
) {
    const {
        meta,
        apartmentId,
        checkIn,
        checkOut,
        nights,
        amountPaidNgn,
    } = validated;

    return withApartmentBookingTransaction(apartmentId, async (tx) => {
        const existing = await tx.booking.findUnique({
            where: { reference: payment.reference },
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
                excludeReference: payment.reference,
            });
            if (overlap) {
                throw new BookingDateConflictError("Overlapping booking exists");
            }

            return tx.booking.update({
                where: { reference: payment.reference },
                data: {
                    status: "PAID",
                    amountPaid: amountPaidNgn,
                    expiresAt: null,
                    paymentProvider: paymentProviderIdToDb(payment.provider),
                    providerTransactionId:
                        payment.providerTransactionId ?? existing.providerTransactionId,
                    bookerEmail,
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
            excludeReference: payment.reference,
        });
        if (overlap) {
            throw new BookingDateConflictError("Overlapping booking exists");
        }

        return tx.booking.create({
            data: {
                reference: payment.reference,
                apartmentId,
                checkIn,
                checkOut,
                nights,
                amountPaid: amountPaidNgn,
                status: "PAID",
                source: "WEBSITE",
                paymentProvider: paymentProviderIdToDb(payment.provider),
                providerTransactionId: payment.providerTransactionId ?? null,
                bookerEmail,
                bookerName: meta.booker_name ?? null,
                bookerPhone: meta.booker_phone ?? null,
                expiresAt: null,
            },
        });
    });
}

export async function confirmBookingFromPayment(payment: VerifiedPayment) {
    const validated = validateVerifiedPaymentInput(payment);

    const existing = await prisma.booking.findUnique({
        where: { reference: payment.reference },
        select: { bookerEmail: true },
    });
    const bookerEmail = resolveBookerEmail({
        holdEmail: existing?.bookerEmail,
        paymentEmail: payment.customerEmail,
    });

    try {
        return await confirmBookingInTransaction(
            payment,
            validated,
            bookerEmail,
        );
    } catch (err) {
        if (
            err instanceof BookingDateConflictError ||
            isExclusionConstraintViolation(err)
        ) {
            await handleBookingDateConflict(
                payment,
                validated,
                bookerEmail,
            );
        }
        throw err;
    }
}

function paystackDataToVerifiedPayment(data: PaystackVerifyData): VerifiedPayment {
    return {
        reference: data.reference,
        provider: "paystack",
        status: data.status,
        amountMinor: data.amount,
        metadata: {
            apartment_id: String(data.metadata?.apartment_id ?? ""),
            check_in: String(data.metadata?.check_in ?? ""),
            check_out: String(data.metadata?.check_out ?? ""),
            booker_name: data.metadata?.booker_name,
            booker_phone: data.metadata?.booker_phone,
        },
        customerEmail: data.customer?.email,
    };
}

/** @deprecated Use confirmBookingFromPayment */
export async function upsertBookingFromPaystack(data: PaystackVerifyData) {
    return confirmBookingFromPayment(paystackDataToVerifiedPayment(data));
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

export async function getBookingByReference(reference: string) {
    return prisma.booking.findUnique({
        where: { reference },
        select: {
            reference: true,
            paymentProvider: true,
            status: true,
        },
    });
}
