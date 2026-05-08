import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { verifyTransaction, verifyWebhookSignature } from "@/lib/paystack";
import { upsertBookingFromPaystack } from "@/lib/booking";
import { inviteUserByEmail } from "@/lib/supabase/server";
import { validationErrorResponse } from "@/lib/validation/http";
import { paystackWebhookPayloadSchema } from "@/lib/validation/schemas";
import { sendAdminAlertBookingPersistenceFailed } from "@/lib/email/admin-alerts";
import {
    enqueuePostBookingJobs,
    flushPostBookingJobsForBooking,
} from "@/lib/ops/bookingJobs";

function agentDebugLog(args: {
    runId: string;
    hypothesisId: string;
    location: string;
    message: string;
    data: Record<string, unknown>;
}) {
    console.info("[agent-debug-5a4661]", args);
    // #region agent log
    void fetch('http://127.0.0.1:7247/ingest/25c7c84e-0b66-4375-9cb5-a5fca9d48dbc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5a4661'},body:JSON.stringify({sessionId:'5a4661',runId:args.runId,hypothesisId:args.hypothesisId,location:args.location,message:args.message,data:args.data,timestamp:Date.now()})}).catch(()=>{});
    // #endregion
}

/** Hobby max is 60s; invoice + Sheets run after response via `after()`. */
export const maxDuration = 60;

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
        agentDebugLog({
            runId: "initial",
            hypothesisId: "H1,H2",
            location: "app/api/paystack/webhook/route.ts:95",
            message: "webhook enqueued jobs before scheduling flush",
            data: { bookingId: booking.id, status: booking.status },
        });
        after(() => {
            agentDebugLog({
                runId: "initial",
                hypothesisId: "H2",
                location: "app/api/paystack/webhook/route.ts:101",
                message: "webhook after callback entered",
                data: { bookingId: booking.id },
            });
            void flushPostBookingJobsForBooking(booking.id);
        });

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
