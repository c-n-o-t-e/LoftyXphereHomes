import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getApartmentById, isApartmentBookable } from "@/lib/data/apartments";
import {
    bookingHoldExpiresAt,
    findOverlappingBooking,
    withApartmentBookingTransaction,
} from "@/lib/booking/conflict";
import {
    cancelBookingHold,
    formatBookingConflictMessage,
} from "@/lib/booking";
import { computeBookingQuote, nightsBetweenStayDates, totalNgnToKobo } from "@/lib/pricing";
import { getClientIp } from "@/lib/http/client-ip";
import { checkPaystackInitRateLimit } from "@/lib/rate-limit/paystack";
import { parseJsonBody } from "@/lib/validation/http";
import { paystackInitializeBodySchema } from "@/lib/validation/schemas";

const PAYSTACK_BASE = "https://api.paystack.co";

export async function POST(request: NextRequest) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
        return NextResponse.json(
            { error: "Paystack is not configured" },
            { status: 500 },
        );
    }

    const parsedBody = await parseJsonBody(
        request,
        paystackInitializeBodySchema,
    );
    if (!parsedBody.success) {
        return parsedBody.response;
    }

    const { email, name, phone, apartmentId, checkIn, checkOut } =
        parsedBody.data;

    const ip = getClientIp(request);
    try {
        const rateLimit = await checkPaystackInitRateLimit(ip, email);
        if (rateLimit.limited) {
            return NextResponse.json(
                {
                    error: "Too many payment attempts. Please wait a few minutes and try again.",
                    code: "RATE_LIMITED",
                },
                { status: 429 },
            );
        }
    } catch (rateLimitError) {
        console.error("paystack initialize: rate limit check failed", rateLimitError);
        return NextResponse.json(
            {
                error: "Payment is temporarily unavailable. Please try again shortly.",
                code: "RATE_LIMIT_UNAVAILABLE",
            },
            { status: 503 },
        );
    }

    const apartment = getApartmentById(apartmentId);
    if (!apartment) {
        return NextResponse.json(
            { error: "Apartment not found" },
            { status: 404 },
        );
    }

    if (!isApartmentBookable(apartment)) {
        return NextResponse.json(
            { error: "This suite is not available for booking yet." },
            { status: 400 },
        );
    }

    const quote = computeBookingQuote(
        apartment.pricePerNight,
        checkIn,
        checkOut,
    );
    if (!quote) {
        return NextResponse.json(
            { error: "Invalid stay dates for pricing" },
            { status: 400 },
        );
    }

    if (quote.totalNgn < 100) {
        return NextResponse.json(
            {
                error: "Computed amount is below the minimum allowed for payment",
            },
            { status: 400 },
        );
    }

    const amountInKobo = totalNgnToKobo(quote.totalNgn);
    const requestedCheckIn = new Date(checkIn);
    const requestedCheckOut = new Date(checkOut);
    const nights = nightsBetweenStayDates(checkIn, checkOut);

    const reference =
        `lxh_${apartmentId}_${Date.now()}_${randomBytes(8).toString("hex")}`.replace(
            /[^a-zA-Z0-9_-]/g,
            "_",
        );

    try {
        const conflictingBooking = await withApartmentBookingTransaction(
            apartmentId,
            async (tx) => {
                const conflict = await findOverlappingBooking(tx, {
                    apartmentId,
                    checkIn: requestedCheckIn,
                    checkOut: requestedCheckOut,
                });
                if (conflict) {
                    return conflict;
                }

                await tx.booking.create({
                    data: {
                        reference,
                        apartmentId,
                        checkIn: requestedCheckIn,
                        checkOut: requestedCheckOut,
                        nights,
                        amountPaid: quote.totalNgn,
                        status: "PENDING",
                        source: "WEBSITE",
                        bookerEmail: email.trim(),
                        bookerName: name?.trim() || null,
                        bookerPhone: phone?.trim() || null,
                        expiresAt: bookingHoldExpiresAt(),
                    },
                });

                return null;
            },
        );

        if (conflictingBooking) {
            return NextResponse.json(
                {
                    error: formatBookingConflictMessage(
                        conflictingBooking.checkIn,
                        conflictingBooking.checkOut,
                    ),
                },
                { status: 409 },
            );
        }
    } catch (dbError) {
        console.error("Database error checking availability:", dbError);
        return NextResponse.json(
            {
                error: "Availability is temporarily unavailable. Please retry before booking.",
                code: "AVAILABILITY_UNAVAILABLE",
            },
            { status: 503 },
        );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const callbackUrl = `${baseUrl}/booking/success?reference=${reference}`;

    let res: Response;
    try {
        res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${secretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email.trim(),
                amount: amountInKobo,
                reference,
                callback_url: callbackUrl,
                metadata: {
                    apartment_id: apartmentId,
                    check_in: checkIn,
                    check_out: checkOut,
                    booker_name: name?.trim() || undefined,
                    booker_phone: phone?.trim() || undefined,
                },
            }),
        });
    } catch (paystackError) {
        await cancelBookingHold(reference);
        console.error("Paystack initialize request failed:", paystackError);
        return NextResponse.json(
            { error: "Failed to initialize payment" },
            { status: 502 },
        );
    }

    const data = await res.json();

    if (!res.ok) {
        await cancelBookingHold(reference);
        return NextResponse.json(
            { error: data.message || "Failed to initialize payment" },
            { status: res.status >= 400 ? res.status : 500 },
        );
    }

    if (!data.status || !data.data?.authorization_url) {
        await cancelBookingHold(reference);
        return NextResponse.json(
            { error: data.message || "Invalid response from Paystack" },
            { status: 500 },
        );
    }

    return NextResponse.json({
        authorization_url: data.data.authorization_url,
        reference: data.data.reference,
    });
}
