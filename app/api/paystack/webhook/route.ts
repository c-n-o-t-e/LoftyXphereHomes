import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction, verifyWebhookSignature } from "@/lib/paystack";
import { upsertBookingFromPaystack } from "@/lib/booking";
import { inviteUserByEmail } from "@/lib/supabase/server";

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

    let payload: { event?: string; data?: { reference?: string } };
    try {
        payload = JSON.parse(body);
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    if (payload.event !== "charge.success") {
        return NextResponse.json({ received: true });
    }

    const reference = payload.data?.reference;
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
        return NextResponse.json(
            { error: "Failed to save booking" },
            { status: 500 },
        );
    }
}
