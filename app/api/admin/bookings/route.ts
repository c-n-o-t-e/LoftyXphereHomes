import { randomBytes } from "crypto";
import { NextRequest, NextResponse, after } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { parseJsonBody, parseSearchParams } from "@/lib/validation/http";
import {
    adminBookingsQuerySchema,
    adminCreateManualBookingBodySchema,
} from "@/lib/validation/schemas";
import {
    enqueuePostBookingJobs,
    flushPostBookingJobsForBooking,
} from "@/lib/ops/bookingJobs";
import { resolveInvoiceIdFromFormInput } from "@/lib/ops/invoiceId";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

function safeManualReference() {
    return `manual_${Date.now()}_${randomBytes(6).toString("hex")}`;
}

const ADMIN_BOOKING_LIST_SELECT = {
    id: true,
    reference: true,
    apartmentId: true,
    checkIn: true,
    checkOut: true,
    nights: true,
    amountPaid: true,
    currency: true,
    status: true,
    source: true,
    bookerEmail: true,
    bookerName: true,
    bookerPhone: true,
    createdAt: true,
    invoiceId: true,
    invoicePdfPath: true,
} as const;

function startOfUtcDay(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export async function GET(request: NextRequest) {
    // receptionist/admin only
    let staffRole: "admin" | "receptionist" = "receptionist";
    try {
        const auth = await requireAdmin(request, ["admin", "receptionist"]);
        staffRole = auth.role;
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        const status = statusCode ?? 401;
        return NextResponse.json(
            { error: status === 403 ? "Forbidden" : "Unauthorized" },
            { status },
        );
    }

    const parsedQuery = parseSearchParams(request, adminBookingsQuerySchema);
    if (!parsedQuery.success) return parsedQuery.response;
    const { q, view, status, apartmentId, limit, cursor } = parsedQuery.data;

    const today = startOfUtcDay(new Date());

    const activeStatuses: ("PAID" | "PENDING")[] = ["PAID", "PENDING"];
    const activeStatusWhere = { in: activeStatuses };

    const viewWhere =
        view === "current"
            ? {
                  status: activeStatusWhere,
                  checkIn: { lte: today },
                  checkOut: { gt: today },
              }
            : view === "upcoming"
              ? {
                    status: activeStatusWhere,
                    checkIn: { gt: today },
                }
              : view === "past"
                ? {
                      status: activeStatusWhere,
                      checkOut: { lte: today },
                  }
                : view === "cancelled"
                  ? { status: "CANCELLED" as const }
                  : {};

    const resolvedInvoiceId = q ? resolveInvoiceIdFromFormInput(q) : null;
    const qText = (q ?? "").trim();

    const searchWhere =
        resolvedInvoiceId && resolvedInvoiceId.length > 0
            ? {
                  OR: [
                      { invoiceId: resolvedInvoiceId },
                      { invoiceId: { contains: resolvedInvoiceId, mode: "insensitive" as const } },
                  ],
              }
            : qText
              ? {
                    OR: [
                        { bookerName: { contains: qText, mode: "insensitive" as const } },
                        { bookerEmail: { contains: qText, mode: "insensitive" as const } },
                        { bookerPhone: { contains: qText, mode: "insensitive" as const } },
                        { invoiceId: { contains: qText, mode: "insensitive" as const } },
                        { reference: { contains: qText, mode: "insensitive" as const } },
                        { apartmentId: { contains: qText, mode: "insensitive" as const } },
                    ],
                }
              : {};

    try {
        const { prisma } = await import("@/lib/db");

        const bookings = await prisma.booking.findMany({
            where: {
                ...(typeof status === "string" ? { status } : {}),
                ...(typeof apartmentId === "string" ? { apartmentId } : {}),
                ...viewWhere,
                ...searchWhere,
            },
            orderBy: [{ checkIn: "desc" }, { id: "desc" }],
            take: limit + 1,
            ...(cursor
                ? {
                      cursor: { id: cursor },
                      skip: 1,
                  }
                : {}),
            select: ADMIN_BOOKING_LIST_SELECT,
        });

        const hasMore = bookings.length > limit;
        const page = hasMore ? bookings.slice(0, limit) : bookings;
        const nextCursor = hasMore ? (page[page.length - 1]?.id ?? null) : null;

        function maskEmail(email: string | null) {
            if (!email) return null;
            const [local, domain] = email.split("@");
            if (!domain) return null;
            const safeLocal = (local ?? "").trim();
            if (!safeLocal) return `***@${domain}`;
            const first = safeLocal[0] ?? "*";
            return `${first}***@${domain}`;
        }

        function maskPhone(phone: string | null) {
            if (!phone) return null;
            const digits = phone.replace(/\D+/g, "");
            if (digits.length < 4) return "***";
            const last4 = digits.slice(-4);
            return `***${last4}`;
        }

        const responseBookings = page.map((b) => ({
            ...b,
            invoiceReady: Boolean(b.invoicePdfPath),
            invoicePdfPath: undefined,
            bookerEmailMasked: maskEmail(b.bookerEmail),
            bookerPhoneMasked: maskPhone(b.bookerPhone),
        }));

        const shapedBookings =
            staffRole === "admin"
                ? responseBookings
                : responseBookings.map((b) => ({
                      ...b,
                      // receptionist: keep operational fields, hide finance + contact PII
                      amountPaid: undefined,
                      currency: undefined,
                      bookerEmail: undefined,
                      bookerPhone: undefined,
                  }));

        const privateHeaders = {
            "Cache-Control": "private, no-store",
        };

        return NextResponse.json(
            {
                ok: true,
                bookings: shapedBookings,
                nextCursor,
                resolvedInvoiceId: resolvedInvoiceId ?? undefined,
            },
            { headers: privateHeaders },
        );
    } catch (err) {
        console.error("admin bookings list failed:", err);
        return NextResponse.json(
            { error: "Failed to fetch bookings" },
            { status: 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    // receptionist/admin only
    try {
        await requireAdmin(request, ["admin", "receptionist"]);
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        const status = statusCode ?? 401;
        return NextResponse.json(
            { error: status === 403 ? "Forbidden" : "Unauthorized" },
            { status },
        );
    }

    const parsed = await parseJsonBody(
        request,
        adminCreateManualBookingBodySchema,
    );
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
        after(async () => {
            await flushPostBookingJobsForBooking(booking.id);
        });

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
