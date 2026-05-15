import {
    processPostBookingJobs,
    enqueuePostBookingJobs,
    flushPostBookingJobsForBooking,
} from "@/lib/ops/bookingJobs";

jest.mock("@/lib/email/guest-booking-email", () => ({
    sendGuestBookingReceiptEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: jest.fn(() => ({
        storage: {
            from: jest.fn(() => ({
                upload: jest.fn().mockResolvedValue({ error: null }),
                download: jest.fn().mockResolvedValue({
                    data: {
                        async arrayBuffer() {
                            return new Uint8Array([112, 100, 102]).buffer;
                        },
                    },
                    error: null,
                }),
            })),
        },
    })),
}));

jest.mock("@/lib/db", () => ({
    prisma: {
        bookingJob: {
            createMany: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
        },
        booking: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock("@/lib/ops/invoicePdf", () => ({
    generateInvoicePdf: jest.fn(),
}));

jest.mock("@/lib/ops/googleSheets", () => ({
    appendBookingRowToSheet: jest.fn(),
}));

jest.mock("@/lib/email/admin-alerts", () => ({
    sendAdminAlertBookingJobFailed: jest.fn().mockResolvedValue(true),
}));

describe("bookingJobs", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("enqueues invoice + guest email + sheets jobs (deduped)", async () => {
        const { prisma } = await import("@/lib/db");
        await enqueuePostBookingJobs("b1");
        expect(prisma.bookingJob.createMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skipDuplicates: true,
                data: expect.arrayContaining([
                    expect.objectContaining({
                        bookingId: "b1",
                        type: "INVOICE_PDF",
                    }),
                    expect.objectContaining({
                        bookingId: "b1",
                        type: "GUEST_BOOKING_EMAIL",
                    }),
                    expect.objectContaining({
                        bookingId: "b1",
                        type: "GOOGLE_SHEETS",
                    }),
                ]),
            }),
        );
    });

    it("processes jobs and marks success", async () => {
        const { prisma } = await import("@/lib/db");
        const { generateInvoicePdf } = await import("@/lib/ops/invoicePdf");
        const { appendBookingRowToSheet } = await import("@/lib/ops/googleSheets");
        const { sendGuestBookingReceiptEmail } = await import(
            "@/lib/email/guest-booking-email"
        );

        (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([
            { id: "j3", bookingId: "b1", type: "GOOGLE_SHEETS", attempts: 0 },
            {
                id: "j2",
                bookingId: "b1",
                type: "GUEST_BOOKING_EMAIL",
                attempts: 0,
            },
            { id: "j1", bookingId: "b1", type: "INVOICE_PDF", attempts: 0 },
        ]);

        (prisma.booking.findUnique as jest.Mock)
            // invoice job booking fetch
            .mockResolvedValueOnce({
                id: "b1",
                apartmentId: "lofty-wuye-01",
                bookerName: "Jane",
                bookerPhone: "0800",
                bookerEmail: "jane@example.com",
                checkIn: new Date("2026-01-01T00:00:00.000Z"),
                checkOut: new Date("2026-01-02T00:00:00.000Z"),
                amountPaid: 1000,
                invoiceId: null,
                invoicePdfPath: null,
                createdAt: new Date("2026-01-01T12:00:00.000Z"),
            })
            // guest email job booking fetch
            .mockResolvedValueOnce({
                id: "b1",
                status: "PAID",
                apartmentId: "lofty-wuye-01",
                bookerName: "Jane",
                bookerEmail: "jane@example.com",
                checkIn: new Date("2026-01-01T00:00:00.000Z"),
                checkOut: new Date("2026-01-02T00:00:00.000Z"),
                amountPaid: 1000,
                invoiceId: "LXH-260101-ABCDEF",
                invoicePdfPath: "booking/b1/LXH-260101-ABCDEF.pdf",
            })
            // sheets job booking fetch
            .mockResolvedValueOnce({
                id: "b1",
                apartmentId: "lofty-wuye-01",
                bookerName: "Jane",
                bookerPhone: "0800",
                bookerEmail: "jane@example.com",
                checkIn: new Date("2026-01-01T00:00:00.000Z"),
                checkOut: new Date("2026-01-02T00:00:00.000Z"),
                amountPaid: 1000,
                invoiceId: "LXH-260101-ABCDEF",
                createdAt: new Date("2026-01-01T12:00:00.000Z"),
                status: "PAID",
            });

        (generateInvoicePdf as jest.Mock).mockResolvedValueOnce({
            invoiceId: "LXH-260101-ABCDEF",
            pdfBytes: Buffer.from("pdf"),
        });

        const result = await processPostBookingJobs({ limit: 10 });

        expect(result).toEqual(
            expect.objectContaining({ processed: 3, succeeded: 3, failed: 0 }),
        );
        expect(prisma.booking.update).toHaveBeenCalled();
        expect(sendGuestBookingReceiptEmail).toHaveBeenCalledWith(
            expect.objectContaining({
                toEmail: "jane@example.com",
                invoiceId: "LXH-260101-ABCDEF",
            }),
        );
        expect(appendBookingRowToSheet).toHaveBeenCalledWith(
            expect.objectContaining({
                checkIn: "2026-01-01",
                checkOut: "2026-01-02",
                invoiceId: "LXH-260101-ABCDEF",
                stayed: true,
            }),
        );
        expect(prisma.bookingJob.update).toHaveBeenCalledTimes(3);
    });

    it("passes stayed false when booking is CANCELLED", async () => {
        const { prisma } = await import("@/lib/db");
        const { generateInvoicePdf } = await import("@/lib/ops/invoicePdf");
        const { appendBookingRowToSheet } = await import("@/lib/ops/googleSheets");
        const { sendGuestBookingReceiptEmail } = await import(
            "@/lib/email/guest-booking-email"
        );

        (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([
            { id: "j3", bookingId: "b1", type: "GOOGLE_SHEETS", attempts: 0 },
            {
                id: "j2",
                bookingId: "b1",
                type: "GUEST_BOOKING_EMAIL",
                attempts: 0,
            },
            { id: "j1", bookingId: "b1", type: "INVOICE_PDF", attempts: 0 },
        ]);

        (prisma.booking.findUnique as jest.Mock)
            .mockResolvedValueOnce({
                id: "b1",
                apartmentId: "lofty-wuye-01",
                bookerName: "Jane",
                bookerPhone: "0800",
                bookerEmail: "jane@example.com",
                checkIn: new Date("2026-06-01T00:00:00.000Z"),
                checkOut: new Date("2026-06-03T00:00:00.000Z"),
                amountPaid: 2000,
                invoiceId: null,
                invoicePdfPath: null,
                createdAt: new Date("2026-01-01T12:00:00.000Z"),
            })
            .mockResolvedValueOnce({
                id: "b1",
                status: "CANCELLED",
                apartmentId: "lofty-wuye-01",
                bookerName: "Jane",
                bookerEmail: "jane@example.com",
                checkIn: new Date("2026-06-01T00:00:00.000Z"),
                checkOut: new Date("2026-06-03T00:00:00.000Z"),
                amountPaid: 2000,
                invoiceId: "LXH-260101-ABCDEF",
                invoicePdfPath: "booking/b1/LXH-260101-ABCDEF.pdf",
            })
            .mockResolvedValueOnce({
                id: "b1",
                apartmentId: "lofty-wuye-01",
                bookerName: "Jane",
                bookerPhone: "0800",
                bookerEmail: "jane@example.com",
                checkIn: new Date("2026-06-01T00:00:00.000Z"),
                checkOut: new Date("2026-06-03T00:00:00.000Z"),
                amountPaid: 2000,
                invoiceId: "LXH-260101-ABCDEF",
                createdAt: new Date("2026-01-01T12:00:00.000Z"),
                status: "CANCELLED",
            });

        (generateInvoicePdf as jest.Mock).mockResolvedValueOnce({
            invoiceId: "LXH-260101-ABCDEF",
            pdfBytes: Buffer.from("pdf"),
        });

        await processPostBookingJobs({ limit: 10 });

        expect(sendGuestBookingReceiptEmail).not.toHaveBeenCalled();
        expect(appendBookingRowToSheet).toHaveBeenCalledWith(
            expect.objectContaining({
                stayed: false,
                checkIn: "2026-06-01",
            }),
        );
    });

    it("can process jobs for one booking", async () => {
        const { prisma } = await import("@/lib/db");

        (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([]);

        await processPostBookingJobs({ bookingId: "b1", limit: 3 });

        expect(prisma.bookingJob.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    bookingId: "b1",
                    OR: expect.arrayContaining([{ status: "FAILED" }]),
                }),
                take: 3,
            }),
        );
    });

    it("scheduled mode uses nextRunAt backoff (FAILED with future nextRunAt excluded)", async () => {
        const { prisma } = await import("@/lib/db");
        (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([]);

        await processPostBookingJobs({ limit: 5, respectBackoff: true });

        expect(prisma.bookingJob.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    OR: [{ nextRunAt: null }, { nextRunAt: { lte: expect.any(Date) } }],
                }),
            }),
        );
    });

    it("immediate mode includes FAILED jobs even when nextRunAt is in the future", async () => {
        const { prisma } = await import("@/lib/db");
        (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([]);

        await processPostBookingJobs({ limit: 5, respectBackoff: false });

        expect(prisma.bookingJob.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    OR: [
                        { status: "FAILED" },
                        { nextRunAt: null },
                        { nextRunAt: { lte: expect.any(Date) } },
                    ],
                }),
            }),
        );
    });

    it("does not alert admin on the first job failure", async () => {
        const { prisma } = await import("@/lib/db");
        const { generateInvoicePdf } = await import("@/lib/ops/invoicePdf");
        const { sendAdminAlertBookingJobFailed } = await import("@/lib/email/admin-alerts");

        (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([
            {
                id: "j1",
                bookingId: "b1",
                type: "INVOICE_PDF",
                attempts: 0,
                adminAlertSentAt: null,
            },
        ]);
        (prisma.booking.findUnique as jest.Mock).mockResolvedValueOnce({
            id: "b1",
            apartmentId: "lofty-wuye-01",
            bookerName: "Jane",
            bookerPhone: "0800",
            bookerEmail: "jane@example.com",
            checkIn: new Date("2026-01-01T00:00:00.000Z"),
            checkOut: new Date("2026-01-02T00:00:00.000Z"),
            amountPaid: 1000,
            invoiceId: null,
            invoicePdfPath: null,
            createdAt: new Date("2026-01-01T12:00:00.000Z"),
        });
        (generateInvoicePdf as jest.Mock).mockRejectedValueOnce(
            new Error("Chrome unavailable"),
        );

        const result = await processPostBookingJobs({ limit: 10 });

        expect(result).toEqual(
            expect.objectContaining({ processed: 1, succeeded: 0, failed: 1 }),
        );
        expect(sendAdminAlertBookingJobFailed).not.toHaveBeenCalled();
        expect(prisma.bookingJob.update).toHaveBeenCalledTimes(1);
        expect(prisma.bookingJob.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: "j1" },
                data: expect.objectContaining({
                    status: "FAILED",
                    attempts: 1,
                    lastError: "Chrome unavailable",
                }),
            }),
        );
    });

    it("alerts admin once on the second job failure", async () => {
        const { prisma } = await import("@/lib/db");
        const { generateInvoicePdf } = await import("@/lib/ops/invoicePdf");
        const { sendAdminAlertBookingJobFailed } = await import("@/lib/email/admin-alerts");
        const booking = {
            id: "b1",
            reference: "ref_123",
            apartmentId: "lofty-wuye-01",
            bookerName: "Jane",
            bookerPhone: "0800",
            bookerEmail: "jane@example.com",
            checkIn: new Date("2026-01-01T00:00:00.000Z"),
            checkOut: new Date("2026-01-02T00:00:00.000Z"),
            amountPaid: 1000,
            invoiceId: null,
            invoicePdfPath: null,
            createdAt: new Date("2026-01-01T12:00:00.000Z"),
        };

        (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([
            {
                id: "j1",
                bookingId: "b1",
                type: "INVOICE_PDF",
                attempts: 1,
                adminAlertSentAt: null,
            },
        ]);
        (prisma.booking.findUnique as jest.Mock)
            .mockResolvedValueOnce(booking)
            .mockResolvedValueOnce(booking);
        (generateInvoicePdf as jest.Mock).mockRejectedValueOnce(
            new Error("Chrome unavailable"),
        );

        await processPostBookingJobs({ limit: 10 });

        expect(sendAdminAlertBookingJobFailed).toHaveBeenCalledWith(
            expect.objectContaining({
                booking,
                bookingId: "b1",
                jobType: "INVOICE_PDF",
                attempts: 2,
                error: expect.any(Error),
            }),
        );
        expect(prisma.bookingJob.update).toHaveBeenCalledTimes(2);
        expect(prisma.bookingJob.update).toHaveBeenLastCalledWith(
            expect.objectContaining({
                where: { id: "j1" },
                data: expect.objectContaining({
                    adminAlertSentAt: expect.any(Date),
                }),
            }),
        );
    });

    it("does not resend an admin alert for an already alerted failed job", async () => {
        const { prisma } = await import("@/lib/db");
        const { generateInvoicePdf } = await import("@/lib/ops/invoicePdf");
        const { sendAdminAlertBookingJobFailed } = await import("@/lib/email/admin-alerts");

        (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([
            {
                id: "j1",
                bookingId: "b1",
                type: "INVOICE_PDF",
                attempts: 2,
                adminAlertSentAt: new Date("2026-01-01T00:00:00.000Z"),
            },
        ]);
        (prisma.booking.findUnique as jest.Mock).mockResolvedValueOnce({
            id: "b1",
            apartmentId: "lofty-wuye-01",
            bookerName: "Jane",
            bookerPhone: "0800",
            bookerEmail: "jane@example.com",
            checkIn: new Date("2026-01-01T00:00:00.000Z"),
            checkOut: new Date("2026-01-02T00:00:00.000Z"),
            amountPaid: 1000,
            invoiceId: null,
            invoicePdfPath: null,
            createdAt: new Date("2026-01-01T12:00:00.000Z"),
        });
        (generateInvoicePdf as jest.Mock).mockRejectedValueOnce(
            new Error("Chrome unavailable"),
        );

        await processPostBookingJobs({ limit: 10 });

        expect(sendAdminAlertBookingJobFailed).not.toHaveBeenCalled();
        expect(prisma.bookingJob.update).toHaveBeenCalledTimes(1);
    });

    it("logs when admin alert cannot be delivered (e.g. missing RESEND_API_KEY)", async () => {
        const errSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        const { prisma } = await import("@/lib/db");
        const { generateInvoicePdf } = await import("@/lib/ops/invoicePdf");
        const { sendAdminAlertBookingJobFailed } = await import("@/lib/email/admin-alerts");

        (sendAdminAlertBookingJobFailed as jest.Mock).mockResolvedValueOnce(false);

        (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([
            {
                id: "j1",
                bookingId: "b1",
                type: "INVOICE_PDF",
                attempts: 1,
                adminAlertSentAt: null,
            },
        ]);
        (prisma.booking.findUnique as jest.Mock).mockResolvedValueOnce({
            id: "b1",
            reference: "ref_123",
            apartmentId: "lofty-wuye-01",
            bookerName: "Jane",
            bookerPhone: "0800",
            bookerEmail: "jane@example.com",
            checkIn: new Date("2026-01-01T00:00:00.000Z"),
            checkOut: new Date("2026-01-02T00:00:00.000Z"),
            amountPaid: 1000,
            invoiceId: null,
            invoicePdfPath: null,
            createdAt: new Date("2026-01-01T12:00:00.000Z"),
        });
        (generateInvoicePdf as jest.Mock).mockRejectedValueOnce(
            new Error("Chrome unavailable"),
        );

        await processPostBookingJobs({ limit: 10 });

        expect(sendAdminAlertBookingJobFailed).toHaveBeenCalled();
        expect(errSpy).toHaveBeenCalledWith(
            expect.stringContaining("Admin alert email was not sent"),
            expect.objectContaining({ jobId: "j1", bookingId: "b1" }),
        );
        expect(prisma.bookingJob.update).toHaveBeenCalledTimes(1);
        errSpy.mockRestore();
    });

    describe("flushPostBookingJobsForBooking", () => {
        it("scopes job drain to the booking id with limit 3", async () => {
            const { prisma } = await import("@/lib/db");
            (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([]);
            await flushPostBookingJobsForBooking("target-booking");
            expect(prisma.bookingJob.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        bookingId: "target-booking",
                    }),
                    take: 3,
                }),
            );
        });

        it("does not throw when processPostBookingJobs fails", async () => {
            const { prisma } = await import("@/lib/db");
            (prisma.bookingJob.findMany as jest.Mock).mockRejectedValueOnce(
                new Error("db unavailable"),
            );
            await expect(
                flushPostBookingJobsForBooking("target-booking"),
            ).resolves.toBeUndefined();
        });
    });
});

