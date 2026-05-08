import { generateInvoicePdf } from "./invoicePdf";
import { appendBookingRowToSheet } from "./googleSheets";
import { sendAdminAlertBookingJobFailed } from "@/lib/email/admin-alerts";

const INVOICE_STORAGE_BUCKET =
    process.env.INVOICE_STORAGE_BUCKET?.trim() || "Invoices";

const MAX_ATTEMPTS = 5;
const ADMIN_ALERT_ATTEMPT_THRESHOLD = 2;

type BookingJobType = "INVOICE_PDF" | "GOOGLE_SHEETS";

function agentDebugLog(args: {
    runId: string;
    hypothesisId: string;
    location: string;
    message: string;
    data: Record<string, unknown>;
}) {
    console.info("[agent-debug-5a4661]", args);
    // #region agent log
    void fetch('http://127.0.0.1:7247/ingest/25c7c84e-0b66-4375-9cb5-a5fca9d48dbc',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'5a4661'},body:JSON.stringify({sessionId:'5a4661',runId:args.runId,hypothesisId:args.hypothesisId,location:args.location,message:args.message,data:args.data,timestamp:Date.now()})}).catch(()=>{});
    // #endregion
}

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
    const result = await prisma.bookingJob.createMany({
        data: [
            { bookingId, type: "INVOICE_PDF", status: "PENDING" },
            { bookingId, type: "GOOGLE_SHEETS", status: "PENDING" },
        ],
        skipDuplicates: true,
    });
    agentDebugLog({
        runId: "initial",
        hypothesisId: "H1",
        location: "lib/ops/bookingJobs.ts:35",
        message: "post-booking jobs enqueue completed",
        data: { bookingId, createdCount: result?.count ?? null },
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

    agentDebugLog({
        runId: "initial",
        hypothesisId: "H4",
        location: "lib/ops/bookingJobs.ts:112",
        message: "invoice pdf generated before storage upload",
        data: {
            bookingId: booking.id,
            invoiceId: invoice.invoiceId,
            pdfByteLength: invoice.pdfBytes.length,
            bucket: INVOICE_STORAGE_BUCKET,
        },
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

    agentDebugLog({
        runId: "initial",
        hypothesisId: "H5",
        location: "lib/ops/bookingJobs.ts:160",
        message: "google sheets job starting",
        data: {
            bookingId: booking.id,
            invoiceId: booking.invoiceId,
            hasSpreadsheetId: Boolean(
                process.env.GOOGLE_SHEETS_SPREADSHEET_ID ||
                    process.env.SHEET_ID,
            ),
            hasInlineServiceJson: Boolean(
                process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON ||
                    process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
            ),
            hasCredentialsPath: Boolean(
                process.env.GOOGLE_APPLICATION_CREDENTIALS ||
                    process.env.GOOGLE_SHEETS_CREDENTIALS_PATH,
            ),
        },
    });

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

    agentDebugLog({
        runId: "initial",
        hypothesisId: "H2,H3",
        location: "lib/ops/bookingJobs.ts:290",
        message: "post-booking job query completed",
        data: {
            bookingId: args?.bookingId ?? null,
            limit,
            respectBackoff,
            jobCount: jobs.length,
            jobs: jobs.map((job) => ({
                id: job.id,
                bookingId: job.bookingId,
                type: job.type,
                attempts: job.attempts,
            })),
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
            agentDebugLog({
                runId: "initial",
                hypothesisId: "H4,H5",
                location: "lib/ops/bookingJobs.ts:326",
                message: "post-booking job succeeded",
                data: {
                    bookingId: job.bookingId,
                    jobId: job.id,
                    type: job.type,
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
            agentDebugLog({
                runId: "initial",
                hypothesisId: "H4,H5",
                location: "lib/ops/bookingJobs.ts:349",
                message: "post-booking job failed",
                data: {
                    bookingId: job.bookingId,
                    jobId: job.id,
                    type: job.type,
                    nextAttempts,
                    errorName: err instanceof Error ? err.name : typeof err,
                    errorMessage,
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
 * Run invoice + sheet jobs for one booking (two job types max).
 * Safe to call from multiple triggers (webhook + success page): jobs are idempotent at row level.
 * Swallows errors so callers (e.g. Paystack webhook `after()`) never throw.
 */
export async function flushPostBookingJobsForBooking(
    bookingId: string,
): Promise<void> {
    try {
        agentDebugLog({
            runId: "initial",
            hypothesisId: "H2",
            location: "lib/ops/bookingJobs.ts:393",
            message: "flushPostBookingJobsForBooking invoked",
            data: { bookingId },
        });
        const result = await processPostBookingJobs({
            bookingId,
            limit: 2,
            respectBackoff: false,
        });
        agentDebugLog({
            runId: "post-fix",
            hypothesisId: "H2",
            location: "lib/ops/bookingJobs.ts:443",
            message: "flushPostBookingJobsForBooking completed",
            data: { bookingId, ...result },
        });
    } catch (err) {
        agentDebugLog({
            runId: "post-fix",
            hypothesisId: "H2",
            location: "lib/ops/bookingJobs.ts:453",
            message: "flushPostBookingJobsForBooking caught error",
            data: {
                bookingId,
                errorName: err instanceof Error ? err.name : typeof err,
                errorMessage: err instanceof Error ? err.message : String(err),
            },
        });
        console.error(
            "[booking-jobs] flushPostBookingJobsForBooking failed:",
            bookingId,
            err,
        );
    }
}
