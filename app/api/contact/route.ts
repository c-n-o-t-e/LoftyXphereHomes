import { NextRequest, NextResponse, after } from "next/server";
import { contactMessageBodySchema } from "@/lib/validation/schemas";
import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/http/client-ip";
import { checkContactRateLimit } from "@/lib/rate-limit/contact";

export async function POST(request: NextRequest) {
    // Parse raw body first so honeypot can short-circuit even if other fields are invalid.
    let rawBody: unknown = null;
    try {
        rawBody = await request.json();
    } catch {
        // Fall through to standardized validation response.
    }

    if (
        rawBody &&
        typeof rawBody === "object" &&
        "website" in rawBody &&
        typeof (rawBody as { website?: unknown }).website === "string" &&
        (rawBody as { website: string }).website.trim()
    ) {
        // Honeypot: bots often fill hidden fields. Humans should leave empty.
        return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Re-validate using the standardized validator (expects JSON again).
    // Since we've already read the stream, reuse `rawBody` as parsed object here.
    const parsed = contactMessageBodySchema.safeParse(rawBody);
    if (!parsed.success) {
        // Reuse existing standardized error payload shape.
        const { validationErrorResponse } =
            await import("@/lib/validation/http");
        return validationErrorResponse(parsed.error);
    }
    const data = parsed.data;

    const ip = getClientIp(request);

    let rateLimit: { limited: boolean };
    try {
        rateLimit = await checkContactRateLimit(ip, data.email);
    } catch (err) {
        console.error("contact: rate limit check failed", err);
        return NextResponse.json(
            {
                error: "We couldn’t send your message right now. Please try again later.",
                code: "CONTACT_DELIVERY_FAILED",
            },
            { status: 503 },
        );
    }

    if (rateLimit.limited) {
        return NextResponse.json(
            {
                error: "Too many requests. Please wait a few minutes and try again.",
                code: "RATE_LIMITED",
            },
            { status: 429 },
        );
    }

    try {
        const userAgent = request.headers.get("user-agent") ?? null;
        await prisma.contactMessage.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                category: data.category,
                message: data.message,
                ip: ip === "unknown" ? null : ip,
                userAgent,
            },
        });

        after(async () => {
            const { sendContactFormEmails } =
                await import("@/lib/email/contact-notifications");
            try {
                await sendContactFormEmails({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    category: data.category,
                    message: data.message,
                });
            } catch (err) {
                console.error("contact: notification email task failed", err);
            }
        });

        return NextResponse.json({ ok: true }, { status: 200 });
    } catch (err) {
        console.error("contact: failed to persist message", err);
        return NextResponse.json(
            {
                error: "We couldn’t send your message right now. Please try again later.",
                code: "CONTACT_DELIVERY_FAILED",
            },
            { status: 500 },
        );
    }
}
