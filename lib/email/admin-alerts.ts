import type { PaystackVerifyData } from "@/lib/paystack";
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
    paystackData?: PaystackVerifyData;
    error: unknown;
}): Promise<void> {
    await sendAdminAlertEmail({
        subject: `Booking persistence failed (Paystack charge.success) — ${args.reference}`,
        lines: [
            "A Paystack payment appears successful, but saving the booking failed.",
            "",
            `reference: ${args.reference}`,
            `error: ${safeErrorMessage(args.error)}`,
            "",
            "paystackData:",
            safeStringify(args.paystackData ?? null),
        ],
        logContext: {
            reference: args.reference,
            error: args.error,
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
