import { generateInvoicePdf } from "./invoicePdf";
import { appendBookingRowToSheet } from "./googleSheets";
import { sendAdminAlertBookingJobFailed } from "@/lib/email/admin-alerts";
import { resolveBookerEmail } from "@/lib/booking/email";

const INVOICE_STORAGE_BUCKET =
    process.env.INVOICE_STORAGE_BUCKET?.trim() || "Invoices";

const MAX_ATTEMPTS = 5;
const ADMIN_ALERT_ATTEMPT_THRESHOLD = 1;

type BookingJobType = "INVOICE_PDF" | "GUEST_BOOKING_EMAIL" | "GOOGLE_SHEETS";

const JOB_TYPE_PRIORITY: Record<BookingJobType, number> = {
    INVOICE_PDF: 0,
    GUEST_BOOKING_EMAIL: 1,
    GOOGLE_SHEETS: 2,
};

function computeNextRunAt(attempts: number): Date {
    // exponential-ish backoff: 1m, 5m, 15m, 1h, 6h
    const minutes = [1, 5, 15, 60, 360][Math.min(attempts, 4)] ?? 360;
    return new Date(Date.now() + minutes * 60 * 1000);
}

/** Reset orphaned PROCESSING rows so invoice/email/sheets jobs can run again. */
async function recoverStaleProcessingJobs(): Promise<void> {
    const { prisma } = await import("@/lib/db");
    try {
        await prisma.bookingJob.updateMany({
            where: { status: "PROCESSING" },
            data: { status: "PENDING", updatedAt: new Date() },
        });
    } catch (err) {
        console.warn(
            "[booking-jobs] PROCESSING recovery skipped:",
            err instanceof Error ? err.message : err,
        );
    }
}

export async function enqueuePostBookingJobs(bookingId: string) {
    const { prisma } = await import("@/lib/db");
    await prisma.bookingJob.createMany({
        data: [
            { bookingId, type: "INVOICE_PDF", status: "PENDING" },
            { bookingId, type: "GUEST_BOOKING_EMAIL", status: "PENDING" },
            { bookingId, type: "GOOGLE_SHEETS", status: "PENDING" },
        ],
        skipDuplicates: true,
    });
}

async function uploadInvoicePdfToStorage(args: {
    bookingId: string;
    invoiceId: string;
    pdfBytes: Buffer;
}): Promise<{ storageKey: string }> {
    const { createServerSupabaseClient } =
        await import("@/lib/supabase/server");

    const storageKey = `booking/${args.bookingId}/${args.invoiceId}.pdf`;

    const supabase = createServerSupabaseClient();
    const { error } = await supabase.storage
        .from(INVOICE_STORAGE_BUCKET)
        .upload(storageKey, args.pdfBytes, {
            contentType: "application/pdf",
            upsert: true,
        });

    if (error) throw error;

    return { storageKey };
}

async function downloadInvoicePdfFromStorage(
    storageKey: string,
): Promise<Buffer> {
    const { createServerSupabaseClient } =
        await import("@/lib/supabase/server");

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.storage
        .from(INVOICE_STORAGE_BUCKET)
        .download(storageKey);

    if (error) throw error;
    if (!data) throw new Error("Invoice download returned empty body");

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
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
        return {
            invoiceId: booking.invoiceId,
            pdfPath: booking.invoicePdfPath,
        };
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

    const uploaded = await uploadInvoicePdfToStorage({
        bookingId: booking.id,
        invoiceId: invoice.invoiceId,
        pdfBytes: invoice.pdfBytes,
    });

    await prisma.booking.update({
        where: { id: booking.id },
        data: {
            invoiceId: invoice.invoiceId,
            // Persist the storage object key (NOT a local filesystem path).
            invoicePdfPath: uploaded.storageKey,
        },
    });

    return { invoiceId: invoice.invoiceId, pdfPath: uploaded.storageKey };
}

async function runGuestBookingEmailJob(bookingId: string) {
    const { prisma } = await import("@/lib/db");
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
            id: true,
            status: true,
            apartmentId: true,
            bookerName: true,
            bookerEmail: true,
            checkIn: true,
            checkOut: true,
            amountPaid: true,
            invoiceId: true,
            invoicePdfPath: true,
        },
    });
    if (!booking) throw new Error("Booking not found");

    if (booking.status !== "PAID") {
        console.warn("[booking-jobs] skip guest email: booking not PAID", {
            bookingId,
        });
        return;
    }

    let email: string;
    try {
        email = resolveBookerEmail({ holdEmail: booking.bookerEmail });
    } catch {
        console.warn("[booking-jobs] skip guest email: invalid bookerEmail", {
            bookingId,
        });
        return;
    }

    if (!booking.invoiceId || !booking.invoicePdfPath) {
        throw new Error(
            "Guest booking email requires invoiceId and invoicePdfPath",
        );
    }

    const storageKey = String(booking.invoicePdfPath);
    if (storageKey.startsWith("/") || storageKey.includes("private/invoices")) {
        throw new Error(
            "Invoice PDF is not in Supabase storage; cannot attach for guest email",
        );
    }

    const pdfBuffer = await downloadInvoicePdfFromStorage(storageKey);
    const { sendGuestBookingReceiptEmail } =
        await import("@/lib/email/guest-booking-email");

    const ok = await sendGuestBookingReceiptEmail({
        toEmail: email,
        guestName: booking.bookerName ?? email,
        invoiceId: booking.invoiceId,
        apartmentId: booking.apartmentId,
        checkIn: booking.checkIn.toISOString().slice(0, 10),
        checkOut: booking.checkOut.toISOString().slice(0, 10),
        amountPaidNgn: booking.amountPaid,
        pdfBuffer,
    });

    if (!ok) {
        throw new Error("Failed to send guest booking receipt email");
    }
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
    if (type === "GUEST_BOOKING_EMAIL")
        return runGuestBookingEmailJob(bookingId);
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

    await recoverStaleProcessingJobs();

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
            const errorMessage =
                err instanceof Error ? err.message : String(err);
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
                    console.error(
                        "Failed to send booking job admin alert:",
                        alertErr,
                    );
                }
            }

            failed++;
        }
    }

    return { processed: jobs.length, succeeded, failed };
}

/**
 * Run invoice, guest email, and sheet jobs for one booking (three job types max).
 * Safe to call from multiple triggers (webhook + success page): jobs are idempotent at row level.
 * Swallows errors so callers (e.g. Paystack webhook `after()`) never throw.
 */
export async function flushPostBookingJobsForBooking(
    bookingId: string,
): Promise<void> {
    try {
        await processPostBookingJobs({
            bookingId,
            limit: 3,
            respectBackoff: false,
        });
    } catch (err) {
        console.error(
            "[booking-jobs] flushPostBookingJobsForBooking failed:",
            bookingId,
            err,
        );
    }
}
