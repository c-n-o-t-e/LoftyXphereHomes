import type { VerifiedPayment } from "@/lib/payments/types";
import { sendResendEmail } from "./resendSend";

type BookingJobAlertBooking = {
    id: string;
    reference: string;
    apartmentId: string;
    bookerName: string | null;
    bookerEmail: string | null;
    bookerPhone: string | null;
    checkIn: Date;
    checkOut: Date;
    amountPaid: number;
    invoiceId: string | null;
    invoicePdfPath: string | null;
};

function safeStringify(value: unknown): string {
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
}

function safeErrorMessage(err: unknown): string {
    if (!err) return "Unknown error";
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    return safeStringify(err);
}

async function sendAdminAlertEmail(args: {
    subject: string;
    lines: string[];
    logContext: Record<string, unknown>;
}): Promise<boolean> {
    const to = process.env.ADMIN_ALERT_EMAIL?.trim();
    const from =
        process.env.EMAIL_FROM_ALERTS?.trim() ||
        process.env.ADMIN_ALERT_FROM?.trim() ||
        "Lofty Xphere Homes <alerts@loftyxpherehomes.com>";

    if (!to) {
        console.error("Admin alert email not configured", {
            hasAdminAlertEmail: false,
            ...args.logContext,
        });
        return false;
    }

    return sendResendEmail({
        from,
        to: [to],
        subject: args.subject,
        text: args.lines.join("\n"),
        logContext: args.logContext,
    });
}

export async function sendAdminAlertBookingPersistenceFailed(args: {
    reference: string;
    paymentProvider?: string;
    verifiedPayment?: VerifiedPayment;
    /** @deprecated Use verifiedPayment */
    paystackData?: unknown;
    error: unknown;
}): Promise<void> {
    const provider = args.paymentProvider ?? args.verifiedPayment?.provider ?? "paystack";
    const paymentData = args.verifiedPayment ?? args.paystackData ?? null;

    await sendAdminAlertEmail({
        subject: `Booking persistence failed (${provider}) — ${args.reference}`,
        lines: [
            "A payment appears successful, but saving the booking failed.",
            "",
            `reference: ${args.reference}`,
            `paymentProvider: ${provider}`,
            `error: ${safeErrorMessage(args.error)}`,
            "",
            "paymentData:",
            safeStringify(paymentData),
        ],
        logContext: {
            reference: args.reference,
            paymentProvider: provider,
            error: args.error,
        },
    });
}

export async function sendAdminAlertBookingConflictRefund(args: {
    reference: string;
    apartmentId: string;
    checkIn: string;
    checkOut: string;
    bookerEmail?: string | null;
    refundInitiated: boolean;
    refundMessage?: string;
    paymentProvider?: string;
    verifiedPayment?: VerifiedPayment;
    /** @deprecated Use verifiedPayment */
    paystackData?: unknown;
}): Promise<void> {
    const provider = args.paymentProvider ?? args.verifiedPayment?.provider ?? "paystack";
    const paymentData = args.verifiedPayment ?? args.paystackData ?? null;

    await sendAdminAlertEmail({
        subject: `Booking date conflict — refund ${args.refundInitiated ? "queued" : "FAILED"} — ${args.reference}`,
        lines: [
            `A successful ${provider} payment could not be confirmed due to a date conflict.`,
            args.refundInitiated
                ? `An automatic refund was queued with ${provider}.`
                : "Automatic refund FAILED — manual refund required.",
            "",
            `reference: ${args.reference}`,
            `paymentProvider: ${provider}`,
            `apartmentId: ${args.apartmentId}`,
            `checkIn: ${args.checkIn}`,
            `checkOut: ${args.checkOut}`,
            `bookerEmail: ${args.bookerEmail ?? "(unknown)"}`,
            `refundInitiated: ${args.refundInitiated}`,
            ...(args.refundMessage ? [`refundMessage: ${args.refundMessage}`] : []),
            "",
            "paymentData:",
            safeStringify(paymentData),
        ],
        logContext: {
            reference: args.reference,
            apartmentId: args.apartmentId,
            paymentProvider: provider,
            refundInitiated: args.refundInitiated,
        },
    });
}

export async function sendAdminAlertBookingJobFailed(args: {
    booking: BookingJobAlertBooking | null;
    bookingId: string;
    jobType: string;
    attempts: number;
    error: unknown;
}) {
    const booking = args.booking;
    const bookingLabel = booking?.reference || args.bookingId;

    return sendAdminAlertEmail({
        subject: `Booking job failed after retry — ${args.jobType} — ${bookingLabel}`,
        lines: [
            "A post-booking job failed after retry and needs admin attention.",
            "",
            `jobType: ${args.jobType}`,
            `bookingId: ${args.bookingId}`,
            `attempts: ${args.attempts}`,
            `error: ${safeErrorMessage(args.error)}`,
            "",
            "booking:",
            safeStringify(
                booking
                    ? {
                          id: booking.id,
                          reference: booking.reference,
                          apartmentId: booking.apartmentId,
                          bookerName: booking.bookerName,
                          bookerEmail: booking.bookerEmail,
                          bookerPhone: booking.bookerPhone,
                          checkIn: booking.checkIn.toISOString().slice(0, 10),
                          checkOut: booking.checkOut.toISOString().slice(0, 10),
                          amountPaid: booking.amountPaid,
                          invoiceId: booking.invoiceId,
                          invoicePdfPath: booking.invoicePdfPath,
                      }
                    : null,
            ),
        ],
        logContext: {
            bookingId: args.bookingId,
            jobType: args.jobType,
            attempts: args.attempts,
        },
    });
}
