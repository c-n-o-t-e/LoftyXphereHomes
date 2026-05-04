import { generateInvoicePdf } from "./invoicePdf";
import { appendBookingRowToSheet } from "./googleSheets";
import { sendAdminAlertBookingJobFailed } from "@/lib/email/admin-alerts";

const MAX_ATTEMPTS = 5;
const ADMIN_ALERT_ATTEMPT_THRESHOLD = 2;

type BookingJobType = "INVOICE_PDF" | "GOOGLE_SHEETS";

const JOB_TYPE_PRIORITY: Record<BookingJobType, number> = {
    INVOICE_PDF: 0,
    GOOGLE_SHEETS: 1,
};

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

async function sendJobFailureAlertOnce(args: {
    jobId: string;
    bookingId: string;
    jobType: BookingJobType;
    attempts: number;
    error: unknown;
}) {
    const { prisma } = await import("@/lib/db");
    const booking = await prisma.booking.findUnique({
        where: { id: args.bookingId },
        select: {
            id: true,
            reference: true,
            apartmentId: true,
            bookerName: true,
            bookerEmail: true,
            bookerPhone: true,
            checkIn: true,
            checkOut: true,
            amountPaid: true,
            invoiceId: true,
            invoicePdfPath: true,
        },
    });

    const sent = await sendAdminAlertBookingJobFailed({
        booking,
        bookingId: args.bookingId,
        jobType: args.jobType,
        attempts: args.attempts,
        error: args.error,
    });

    if (!sent) {
        console.error(
            "[booking-jobs] Admin alert email was not sent (configure RESEND_API_KEY and ADMIN_ALERT_EMAIL).",
            {
                jobId: args.jobId,
                bookingId: args.bookingId,
                jobType: args.jobType,
                attempts: args.attempts,
            },
        );
    }

    if (sent) {
        await prisma.bookingJob.update({
            where: { id: args.jobId },
            data: { adminAlertSentAt: new Date(), updatedAt: new Date() },
        });
    }
}

export async function processPostBookingJobs(args?: {
    limit?: number;
    bookingId?: string;
    /**
     * When true (default for batch/cron): FAILED rows wait until `nextRunAt` before retrying.
     * When false (manual “immediate”): FAILED rows are picked up on every run regardless of `nextRunAt`.
     * If omitted: `bookingId` alone implies false (targeted drain); otherwise true.
     */
    respectBackoff?: boolean;
}): Promise<{ processed: number; succeeded: number; failed: number }> {
    const limit = Math.min(50, Math.max(1, args?.limit ?? 10));
    const now = new Date();
    const { prisma } = await import("@/lib/db");

    const respectBackoff =
        args?.respectBackoff ?? (args?.bookingId ? false : true);

    const nextRunOr = respectBackoff
        ? [{ nextRunAt: null }, { nextRunAt: { lte: now } }]
        : [
              { status: "FAILED" as const },
              { nextRunAt: null },
              { nextRunAt: { lte: now } },
          ];

    const jobs = await prisma.bookingJob.findMany({
        where: {
            ...(args?.bookingId ? { bookingId: args.bookingId } : {}),
            status: { in: ["PENDING", "FAILED"] },
            attempts: { lt: MAX_ATTEMPTS },
            OR: nextRunOr,
        },
        orderBy: [{ nextRunAt: "asc" }, { createdAt: "asc" }],
        take: limit,
        select: {
            id: true,
            bookingId: true,
            type: true,
            attempts: true,
            adminAlertSentAt: true,
        },
    });

    let succeeded = 0;
    let failed = 0;

    const orderedJobs = [...jobs].sort(
        (a, b) =>
            JOB_TYPE_PRIORITY[a.type as BookingJobType] -
            JOB_TYPE_PRIORITY[b.type as BookingJobType],
    );

    for (const job of orderedJobs) {
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
            const errorMessage = err instanceof Error ? err.message : String(err);
            await prisma.bookingJob.update({
                where: { id: job.id },
                data: {
                    status: "FAILED",
                    attempts: nextAttempts,
                    lastError: errorMessage,
                    nextRunAt: computeNextRunAt(nextAttempts),
                    updatedAt: new Date(),
                },
            });

            if (
                nextAttempts >= ADMIN_ALERT_ATTEMPT_THRESHOLD &&
                !job.adminAlertSentAt
            ) {
                try {
                    await sendJobFailureAlertOnce({
                        jobId: job.id,
                        bookingId: job.bookingId,
                        jobType: job.type as BookingJobType,
                        attempts: nextAttempts,
                        error: err,
                    });
                } catch (alertErr) {
                    console.error("Failed to send booking job admin alert:", alertErr);
                }
            }

            failed++;
        }
    }

    return { processed: jobs.length, succeeded, failed };
}

