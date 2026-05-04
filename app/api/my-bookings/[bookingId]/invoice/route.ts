import fs from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseHeaders } from "@/lib/validation/http";
import { bearerAuthHeaderSchema } from "@/lib/validation/schemas";

function getInvoicesDir(): string {
    return (
        process.env.INVOICES_DIR?.trim() || path.join(process.cwd(), "private", "invoices")
    );
}

export async function GET(
    request: NextRequest,
    ctx: { params: Promise<{ bookingId: string }> },
) {
    const parsedHeaders = parseHeaders(request, bearerAuthHeaderSchema);
    if (!parsedHeaders.success) return parsedHeaders.response;

    const { bookingId } = await ctx.params;
    if (!bookingId || typeof bookingId !== "string") {
        return NextResponse.json({ error: "Invalid booking id" }, { status: 400 });
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

    if (authError || !user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/db");
    const booking = await prisma.booking.findFirst({
        where: { id: bookingId, bookerEmail: user.email },
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

    const invoicesDir = path.resolve(getInvoicesDir());
    const pdfPath = path.resolve(String(booking.invoicePdfPath));
    if (!pdfPath.startsWith(invoicesDir + path.sep) && pdfPath !== invoicesDir) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let pdf: Buffer;
    try {
        pdf = await fs.readFile(pdfPath);
    } catch {
        return NextResponse.json(
            { error: "Invoice file not found" },
            { status: 404 },
        );
    }

    const fileName = booking.invoiceId
        ? `invoice_${booking.invoiceId}.pdf`
        : `invoice_${booking.id}.pdf`;

    // NextResponse expects a web BodyInit; convert Node Buffer -> Uint8Array
    const body = new Uint8Array(pdf);
    return new NextResponse(body, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${fileName}"`,
            "Cache-Control": "private, no-store",
        },
    });
}

