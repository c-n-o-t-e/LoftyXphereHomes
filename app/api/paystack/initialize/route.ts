import { NextRequest, NextResponse } from "next/server";
import { cancelBookingHold } from "@/lib/booking";
import { getPaymentProvider } from "@/lib/payments";
import { buildBookingSuccessCallbackUrl } from "@/lib/payments/successCallbackUrl";
import { createCheckoutHold } from "@/lib/payments/createCheckoutHold";
import { getClientIp } from "@/lib/http/client-ip";
import { checkPaymentInitRateLimit } from "@/lib/rate-limit/payment-init";
import { parseJsonBody } from "@/lib/validation/http";
import { paymentInitializeBodySchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
    if (!process.env.PAYSTACK_SECRET_KEY) {
        return NextResponse.json(
            { error: "Paystack is not configured" },
            { status: 500 },
        );
    }

    const parsedBody = await parseJsonBody(request, paymentInitializeBodySchema);
    if (!parsedBody.success) {
        return parsedBody.response;
    }

    const { email, name, phone, apartmentId, checkIn, checkOut } =
        parsedBody.data;

    const ip = getClientIp(request);
    try {
        const rateLimit = await checkPaymentInitRateLimit(ip, email);
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

    const hold = await createCheckoutHold({
        email,
        name,
        phone,
        apartmentId,
        checkIn,
        checkOut,
        paymentProvider: "paystack",
    });

    if (!hold.ok) {
        return NextResponse.json(
            hold.code ? { error: hold.error, code: hold.code } : { error: hold.error },
            { status: hold.status },
        );
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const callbackUrl = buildBookingSuccessCallbackUrl(
        baseUrl,
        hold.reference,
        "paystack",
    );

    try {
        const provider = getPaymentProvider("paystack");
        const init = await provider.initializeCheckout({
            email,
            name,
            phone,
            apartmentId,
            checkIn,
            checkOut,
            reference: hold.reference,
            callbackUrl,
            amountNgn: hold.quote.totalNgn,
        });

        return NextResponse.json({
            authorization_url: init.authorizationUrl,
            reference: init.reference,
        });
    } catch (paystackError) {
        await cancelBookingHold(hold.reference);
        console.error("Paystack initialize request failed:", paystackError);
        return NextResponse.json(
            {
                error:
                    paystackError instanceof Error
                        ? paystackError.message
                        : "Failed to initialize payment",
            },
            { status: 502 },
        );
    }
}
