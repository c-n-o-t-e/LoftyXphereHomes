import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { setStayedByInvoiceId } from "@/lib/ops/googleSheets";
import { resolveInvoiceIdFromFormInput } from "@/lib/ops/invoiceId";
import { parseJsonBody } from "@/lib/validation/http";
import { adminCancelBookingBodySchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
    try {
        await requireAdmin(request, ["admin", "receptionist"]);
    } catch (err) {
        const httpResponse = (err as any)?.httpResponse;
        if (httpResponse) return httpResponse;
        const status = (err as any)?.statusCode ?? 401;
        return NextResponse.json(
            { error: status === 403 ? "Forbidden" : "Unauthorized" },
            { status },
        );
    }

    const parsed = await parseJsonBody(request, adminCancelBookingBodySchema);
    if (!parsed.success) return parsed.response;

    const resolved = resolveInvoiceIdFromFormInput(parsed.data.invoiceInput);
    if (!resolved) {
        return NextResponse.json(
            {
                error: "Could not read invoice ID. Paste a valid id like LXH-YYMMDD-XXXXXX or text that contains it.",
                code: "INVALID_INVOICE_INPUT",
            },
            { status: 400 },
        );
    }

    try {
        const { prisma } = await import("@/lib/db");

        const booking = await prisma.booking.findFirst({
            where: { invoiceId: resolved },
            select: { id: true, status: true, invoiceId: true },
        });

        if (!booking) {
            return NextResponse.json(
                {
                    error: "No booking found for this invoice ID.",
                    code: "BOOKING_NOT_FOUND",
                },
                { status: 404 },
            );
        }

        if (booking.status === "CANCELLED") {
            return NextResponse.json(
                {
                    ok: true,
                    bookingId: booking.id,
                    invoiceId: resolved,
                    alreadyCancelled: true,
                },
                { status: 200 },
            );
        }

        const previousStatus = booking.status;

        await prisma.booking.update({
            where: { id: booking.id },
            data: { status: "CANCELLED" },
        });

        try {
            const sheet = await setStayedByInvoiceId({
                invoiceId: resolved,
                stayed: false,
            });
            return NextResponse.json({
                ok: true,
                bookingId: booking.id,
                invoiceId: resolved,
                sheetTitle: sheet.sheetTitle,
                rowNumber: sheet.rowNumber,
            });
        } catch (sheetErr: unknown) {
            const statusCode = (sheetErr as any)?.statusCode;
            if (statusCode === 404) {
                return NextResponse.json({
                    ok: true,
                    bookingId: booking.id,
                    invoiceId: resolved,
                    warning:
                        "Booking marked cancelled in the database, but this invoice ID was not found in Google Sheets.",
                    code: "SHEETS_ROW_NOT_FOUND",
                });
            }
            await prisma.booking.update({
                where: { id: booking.id },
                data: { status: previousStatus },
            });
            console.error("admin cancel booking sheets error:", sheetErr);
            return NextResponse.json(
                {
                    error: "Could not update Google Sheets. Booking was not cancelled.",
                    code: "SHEETS_UPDATE_FAILED",
                },
                { status: 502 },
            );
        }
    } catch (err) {
        console.error("admin cancel booking failed:", err);
        return NextResponse.json(
            { error: "Failed to cancel booking" },
            { status: 500 },
        );
    }
}
