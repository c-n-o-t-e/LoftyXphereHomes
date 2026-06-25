import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { myBookingsWhereForUser } from "@/lib/booking/myBookings";
import { parseHeaders } from "@/lib/validation/http";
import { bearerAuthHeaderSchema } from "@/lib/validation/schemas";

const INVOICE_STORAGE_BUCKET =
    process.env.INVOICE_STORAGE_BUCKET?.trim() || "Invoices";

export async function GET(
    request: NextRequest,
    ctx: { params: Promise<{ bookingId: string }> },
) {
    const parsedHeaders = parseHeaders(request, bearerAuthHeaderSchema);
    if (!parsedHeaders.success) return parsedHeaders.response;

    const { bookingId } = await ctx.params;
    if (!bookingId || typeof bookingId !== "string") {
        return NextResponse.json(
            { error: "Invalid booking id" },
            { status: 400 },
        );
    }

    const token = parsedHeaders.data.authorization.replace(/^Bearer\s+/i, "");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.json(
            { error: "Service temporarily unavailable" },
            { status: 500 },
        );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user?.email || !user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/db");
    const booking = await prisma.booking.findFirst({
        where: {
            id: bookingId,
            ...myBookingsWhereForUser({
                id: user.id,
                email: user.email,
            }),
        },
        select: {
            id: true,
            invoiceId: true,
            invoicePdfPath: true,
        },
    });

    if (!booking) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!booking.invoicePdfPath) {
        return NextResponse.json(
            {
                error: "Invoice is still being prepared. Please try again shortly.",
                code: "INVOICE_NOT_READY",
            },
            { status: 409 },
        );
    }

    const storageKey = String(booking.invoicePdfPath);

    // Legacy rows may contain a local filesystem path; those are not retrievable on Vercel.
    if (storageKey.startsWith("/") || storageKey.includes("private/invoices")) {
        return NextResponse.json(
            {
                error: "Invoice storage needs to be regenerated. Please try again shortly.",
                code: "INVOICE_STORAGE_MIGRATION_REQUIRED",
            },
            { status: 409 },
        );
    }

    const { createServerSupabaseClient } =
        await import("@/lib/supabase/server");
    const adminSupabase = createServerSupabaseClient();
    const { data, error } = await adminSupabase.storage
        .from(INVOICE_STORAGE_BUCKET)
        .createSignedUrl(storageKey, 60);

    if (error || !data?.signedUrl) {
        return NextResponse.json(
            { error: "Invoice file not found" },
            { status: 404 },
        );
    }

    // Redirect to a short-lived signed URL so downloads work reliably on Vercel.
    return NextResponse.redirect(data.signedUrl, {
        status: 302,
        headers: {
            "Cache-Control": "private, no-store",
        },
    });
}
