import { NextRequest, NextResponse } from "next/server";
import { verifyTransaction } from "@/lib/paystack";
import { upsertBookingFromPaystack } from "@/lib/booking";
import { parseSearchParams } from "@/lib/validation/http";
import { bookingVerifyQuerySchema } from "@/lib/validation/schemas";

/**
 * GET /api/bookings/verify?reference=xxx
 * Verifies the Paystack transaction and creates/updates the booking in the DB.
 * Call this from the booking success page to ensure the booking is recorded.
 */
export async function GET(request: NextRequest) {
    const parsedQuery = parseSearchParams(request, bookingVerifyQuerySchema);
    if (!parsedQuery.success) {
        return parsedQuery.response;
    }
    const reference = parsedQuery.data.reference.trim();

    const result = await verifyTransaction(reference);
    if (!result) {
        return NextResponse.json(
            { error: "Paystack is not configured" },
            { status: 500 },
        );
    }

    if (!result.status || !result.data) {
        return NextResponse.json(
            {
                error:
                    result.message ??
                    "Transaction not found or verification failed",
            },
            { status: 400 },
        );
    }

    const data = result.data;
    if (data.status !== "success") {
        return NextResponse.json(
            {
                error: "Payment was not successful",
                data: { status: data.status },
            },
            { status: 400 },
        );
    }

    try {
        const booking = await upsertBookingFromPaystack(data);
        return NextResponse.json({
            success: true,
            booking: {
                id: booking.id,
                reference: booking.reference,
                apartmentId: booking.apartmentId,
                checkIn: booking.checkIn.toISOString().split("T")[0],
                checkOut: booking.checkOut.toISOString().split("T")[0],
                nights: booking.nights,
                amountPaid: booking.amountPaid,
                status: booking.status,
                bookerEmail: booking.bookerEmail,
                bookerName: booking.bookerName,
                bookerPhone: booking.bookerPhone,
            },
        });
    } catch (err) {
        console.error("Booking upsert error:", err);
        return NextResponse.json(
            { error: "Failed to save booking" },
            { status: 500 },
        );
    }
}
// if a user searches an apartment from the search bar on the selected apartment page the chosen date should still be used ie the user doesn't need to start putting in their dates again
