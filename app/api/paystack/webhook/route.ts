import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction, verifyWebhookSignature } from "@/lib/paystack";
import { upsertBookingFromPaystack } from "@/lib/booking";
import { inviteUserByEmail } from "@/lib/supabase/server";
import { validationErrorResponse } from "@/lib/validation/http";
import { paystackWebhookPayloadSchema } from "@/lib/validation/schemas";
import { sendAdminAlertBookingPersistenceFailed } from "@/lib/email/admin-alerts";
import {
    enqueuePostBookingJobs,
    processPostBookingJobs,
} from "@/lib/ops/bookingJobs";

/**
 * POST /api/paystack/webhook
 * Paystack sends events here (e.g. charge.success).
 * Configure this URL in Paystack Dashboard: Settings → Webhooks.
 */
export async function POST(request: NextRequest) {
    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
        return NextResponse.json(
            { error: "Missing signature" },
            { status: 401 },
        );
    }

    let body: string;
    try {
        body = await request.text();
    } catch {
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    if (!verifyWebhookSignature(body, signature)) {
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 401 },
        );
    }

    let payload: unknown;
    try {
        payload = JSON.parse(body);
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsedPayload = paystackWebhookPayloadSchema.safeParse(payload);
    if (!parsedPayload.success) {
        return validationErrorResponse(parsedPayload.error);
    }

    if (parsedPayload.data.event !== "charge.success") {
        return NextResponse.json({ received: true });
    }

    const reference = parsedPayload.data.data?.reference?.trim();
    if (!reference) {
        return NextResponse.json(
            { error: "Missing reference" },
            { status: 400 },
        );
    }

    const result = await verifyTransaction(reference);
    if (!result?.status || !result.data) {
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 400 },
        );
    }

    try {
        const booking = await upsertBookingFromPaystack(result.data);
        // Enqueue downstream artifacts (invoice + Google Sheets)
        await enqueuePostBookingJobs(booking.id);
        // Best-effort: process this booking immediately so it does not wait for cron.
        // Safe to call repeatedly (jobs are deduped; Sheets append checks invoiceId).
        try {
            await processPostBookingJobs({ bookingId: booking.id, limit: 2 });
        } catch (err) {
            console.error("Failed to process post-booking jobs:", err);
        }

        // Send magic link to create/login user account
        // This runs async and doesn't block the webhook response
        if (booking.bookerEmail && booking.status === "PAID") {
            inviteUserByEmail(booking.bookerEmail).catch((err) => {
                console.error("Failed to send magic link:", err);
                // Don't fail the webhook if email fails
            });
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error("Webhook booking upsert error:", err);
        try {
            await sendAdminAlertBookingPersistenceFailed({
                reference,
                paystackData: result.data,
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
