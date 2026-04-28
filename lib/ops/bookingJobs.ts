import { generateInvoicePdf } from "./invoicePdf";
import { appendBookingRowToSheet } from "./googleSheets";

const MAX_ATTEMPTS = 5;

type BookingJobType = "INVOICE_PDF" | "GOOGLE_SHEETS";

function computeNextRunAt(attempts: number): Date {
    // exponential-ish backoff: 1m, 5m, 15m, 1h, 6h
    const minutes = [1, 5, 15, 60, 360][Math.min(attempts, 4)] ?? 360;
    return new Date(Date.now() + minutes * 60 * 1000);
}

export async function enqueuePostBookingJobs(bookingId: string) {
    const { prisma } = await import("@/lib/db");
    await prisma.bookingJob.createMany({
        data: [
            { bookingId, type: "INVOICE_PDF", status: "PENDING" },
            { bookingId, type: "GOOGLE_SHEETS", status: "PENDING" },
        ],
        skipDuplicates: true,
    });
}

async function runInvoiceJob(bookingId: string) {
    const { prisma } = await import("@/lib/db");
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
            id: true,
            apartmentId: true,
            bookerName: true,
            bookerPhone: true,
            bookerEmail: true,
            checkIn: true,
            checkOut: true,
            amountPaid: true,
            invoiceId: true,
            invoicePdfPath: true,
            createdAt: true,
        },
    });
    if (!booking) throw new Error("Booking not found");

    if (booking.invoiceId && booking.invoicePdfPath) {
        return { invoiceId: booking.invoiceId, pdfPath: booking.invoicePdfPath };
    }

    const checkIn = booking.checkIn.toISOString().slice(0, 10);
    const checkOut = booking.checkOut.toISOString().slice(0, 10);
    const invoice = await generateInvoicePdf({
        name: booking.bookerName ?? booking.bookerEmail ?? "Guest",
        phone: booking.bookerPhone ?? "",
        apartment: booking.apartmentId,
        checkIn,
        checkOut,
        amountNgn: booking.amountPaid,
        bookingDate: booking.createdAt,
        invoiceId: booking.invoiceId ?? undefined,
    });

    await prisma.booking.update({
        where: { id: booking.id },
        data: { invoiceId: invoice.invoiceId, invoicePdfPath: invoice.pdfPath },
    });

    return invoice;
}

async function runSheetsJob(bookingId: string) {
    const { prisma } = await import("@/lib/db");
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
            id: true,
            apartmentId: true,
            bookerName: true,
            bookerPhone: true,
            bookerEmail: true,
            checkIn: true,
            checkOut: true,
            amountPaid: true,
            invoiceId: true,
            createdAt: true,
            status: true,
        },
    });
    if (!booking) throw new Error("Booking not found");
    if (!booking.invoiceId) {
        throw new Error("Missing invoiceId (invoice job must run first)");
    }

    const checkIn = booking.checkIn.toISOString().slice(0, 10);
    const checkOut = booking.checkOut.toISOString().slice(0, 10);

    await appendBookingRowToSheet({
        name: booking.bookerName ?? booking.bookerEmail ?? "Guest",
        phone: booking.bookerPhone ?? "",
        apartment: booking.apartmentId,
        checkIn,
        checkOut,
        amountNgn: booking.amountPaid,
        bookingDate: booking.createdAt,
        stayed: booking.status !== "CANCELLED",
        invoiceId: booking.invoiceId,
    });
}

async function runJob(bookingId: string, type: BookingJobType) {
    if (type === "INVOICE_PDF") return runInvoiceJob(bookingId);
    if (type === "GOOGLE_SHEETS") return runSheetsJob(bookingId);
    const neverType: never = type;
    throw new Error("Unknown job type: " + neverType);
}

export async function processPostBookingJobs(args?: {
    limit?: number;
}): Promise<{ processed: number; succeeded: number; failed: number }> {
    const limit = Math.min(50, Math.max(1, args?.limit ?? 10));
    const now = new Date();
    const { prisma } = await import("@/lib/db");

    const jobs = await prisma.bookingJob.findMany({
        where: {
            status: { in: ["PENDING", "FAILED"] },
            attempts: { lt: MAX_ATTEMPTS },
            OR: [{ nextRunAt: null }, { nextRunAt: { lte: now } }],
        },
        orderBy: [{ nextRunAt: "asc" }, { createdAt: "asc" }],
        take: limit,
        select: {
            id: true,
            bookingId: true,
            type: true,
            attempts: true,
        },
    });

    let succeeded = 0;
    let failed = 0;

    for (const job of jobs) {
        try {
            await runJob(job.bookingId, job.type as BookingJobType);
            await prisma.bookingJob.update({
                where: { id: job.id },
                data: {
                    status: "SUCCESS",
                    lastError: null,
                    nextRunAt: null,
                    updatedAt: new Date(),
                },
            });
            succeeded++;
        } catch (err) {
            const nextAttempts = job.attempts + 1;
            await prisma.bookingJob.update({
                where: { id: job.id },
                data: {
                    status: "FAILED",
                    attempts: nextAttempts,
                    lastError: err instanceof Error ? err.message : String(err),
                    nextRunAt: computeNextRunAt(nextAttempts),
                    updatedAt: new Date(),
                },
            });
            failed++;
        }
    }

    return { processed: jobs.length, succeeded, failed };
}

