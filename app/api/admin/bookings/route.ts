import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { parseJsonBody } from "@/lib/validation/http";
import { adminCreateManualBookingBodySchema } from "@/lib/validation/schemas";
import { enqueuePostBookingJobs } from "@/lib/ops/bookingJobs";

function safeManualReference() {
    return `manual_${Date.now()}_${randomBytes(6).toString("hex")}`;
}

export async function POST(request: NextRequest) {
    // receptionist/admin only
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

    const parsed = await parseJsonBody(request, adminCreateManualBookingBodySchema);
    if (!parsed.success) return parsed.response;

    const body = parsed.data;

    const checkInDate = new Date(`${body.checkIn}T00:00:00.000Z`);
    const checkOutDate = new Date(`${body.checkOut}T00:00:00.000Z`);
    const nights = Math.max(
        1,
        Math.round(
            (checkOutDate.getTime() - checkInDate.getTime()) /
                (1000 * 60 * 60 * 24),
        ),
    );

    try {
        const { prisma } = await import("@/lib/db");

        // prevent overlap against PAID/PENDING
        const conflicting = await prisma.booking.findFirst({
            where: {
                apartmentId: body.apartmentId,
                status: { in: ["PAID", "PENDING"] },
                checkIn: { lt: checkOutDate },
                checkOut: { gt: checkInDate },
            },
            select: { id: true, checkIn: true, checkOut: true },
        });
        if (conflicting) {
            return NextResponse.json(
                {
                    error: "This apartment is already booked for those dates.",
                    code: "DATE_CONFLICT",
                },
                { status: 409 },
            );
        }

        // Create booking as PAID (manual payment already taken)
        const booking = await prisma.booking.create({
            data: {
                reference: safeManualReference(),
                apartmentId: body.apartmentId,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                nights,
                amountPaid: body.amountNgn,
                status: "PAID",
                source: "MANUAL",
                bookerEmail: body.email ?? null,
                bookerName: body.name,
                bookerPhone: body.phone,
                manualPaymentMethod: body.paymentMethod ?? null,
                manualPaymentReference: body.paymentReference ?? null,
            },
        });

        await enqueuePostBookingJobs(booking.id);

        return NextResponse.json({
            ok: true,
            bookingId: booking.id,
            reference: booking.reference,
        });
    } catch (err) {
        console.error("admin manual booking failed:", err);
        return NextResponse.json(
            { error: "Failed to create booking" },
            { status: 500 },
        );
    }
}

