import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { verifyWebhookHash } from "@/lib/flutterwave";
import {
    BookingDateConflictError,
    confirmBookingFromPayment,
} from "@/lib/booking";
import { getPaymentProvider } from "@/lib/payments";
import { inviteUserByEmail } from "@/lib/supabase/server";
import { validationErrorResponse } from "@/lib/validation/http";
import { flutterwaveWebhookPayloadSchema } from "@/lib/validation/schemas";
import { sendAdminAlertBookingPersistenceFailed } from "@/lib/email/admin-alerts";
import {
    enqueuePostBookingJobs,
    flushPostBookingJobsForBooking,
} from "@/lib/ops/bookingJobs";

/** Hobby max is 60s; invoice + Sheets run after response via `after()`. */
export const maxDuration = 60;

/**
 * POST /api/flutterwave/webhook
 * Flutterwave sends events here (e.g. charge.completed).
 * Configure this URL in Flutterwave Dashboard → Settings → Webhooks.
 */
export async function POST(request: NextRequest) {
    const verifHash = request.headers.get("verif-hash");
    if (!verifHash) {
        return NextResponse.json(
            { error: "Missing verif-hash" },
            { status: 401 },
        );
    }

    if (!verifyWebhookHash(verifHash)) {
        return NextResponse.json(
            { error: "Invalid verif-hash" },
            { status: 401 },
        );
    }

    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsedPayload = flutterwaveWebhookPayloadSchema.safeParse(payload);
    if (!parsedPayload.success) {
        return validationErrorResponse(parsedPayload.error);
    }

    if (parsedPayload.data.event !== "charge.completed") {
        return NextResponse.json({ received: true });
    }

    const reference = parsedPayload.data.data?.tx_ref?.trim();
    if (!reference) {
        return NextResponse.json(
            { error: "Missing tx_ref" },
            { status: 400 },
        );
    }

    const provider = getPaymentProvider("flutterwave");
    const verified = await provider.verifyPayment(reference);
    if (!verified || verified.status !== "success") {
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 400 },
        );
    }

    try {
        const booking = await confirmBookingFromPayment(verified);
        await enqueuePostBookingJobs(booking.id);
        after(async () => {
            await flushPostBookingJobsForBooking(booking.id);
        });

        if (booking.bookerEmail && booking.status === "PAID") {
            inviteUserByEmail(booking.bookerEmail).catch((err) => {
                console.error("Failed to send magic link:", err);
            });
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        if (err instanceof BookingDateConflictError) {
            return NextResponse.json({
                received: true,
                conflictResolved: true,
                refundInitiated: err.refundInitiated,
            });
        }

        console.error("Flutterwave webhook booking upsert error:", err);
        try {
            await sendAdminAlertBookingPersistenceFailed({
                reference,
                paymentProvider: "flutterwave",
                verifiedPayment: verified,
                error: err,
            });
        } catch (alertErr) {
            console.error("Failed to send admin alert email:", alertErr);
        }
        return NextResponse.json(
            { error: "Failed to save booking" },
            { status: 500 },
        );
    }
}
