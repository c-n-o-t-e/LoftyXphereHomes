import { processPostBookingJobs, enqueuePostBookingJobs } from "@/lib/ops/bookingJobs";

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

    it("enqueues invoice + sheets jobs (deduped)", async () => {
        const { prisma } = await import("@/lib/db");
        await enqueuePostBookingJobs("b1");
        expect(prisma.bookingJob.createMany).toHaveBeenCalledWith(
            expect.objectContaining({
                skipDuplicates: true,
                data: expect.arrayContaining([
                    expect.objectContaining({ bookingId: "b1", type: "INVOICE_PDF" }),
                    expect.objectContaining({ bookingId: "b1", type: "GOOGLE_SHEETS" }),
                ]),
            }),
        );
    });

    it("processes jobs and marks success", async () => {
        const { prisma } = await import("@/lib/db");
        const { generateInvoicePdf } = await import("@/lib/ops/invoicePdf");
        const { appendBookingRowToSheet } = await import("@/lib/ops/googleSheets");

        (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([
            { id: "j2", bookingId: "b1", type: "GOOGLE_SHEETS", attempts: 0 },
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
            pdfPath: "/tmp/inv.pdf",
        });

        const result = await processPostBookingJobs({ limit: 10 });

        expect(result).toEqual(
            expect.objectContaining({ processed: 2, succeeded: 2, failed: 0 }),
        );
        expect(prisma.booking.update).toHaveBeenCalled();
        expect(appendBookingRowToSheet).toHaveBeenCalledWith(
            expect.objectContaining({
                checkIn: "2026-01-01",
                checkOut: "2026-01-02",
                invoiceId: "LXH-260101-ABCDEF",
                stayed: true,
            }),
        );
        expect(prisma.bookingJob.update).toHaveBeenCalledTimes(2);
    });

    it("passes stayed false when booking is CANCELLED", async () => {
        const { prisma } = await import("@/lib/db");
        const { generateInvoicePdf } = await import("@/lib/ops/invoicePdf");
        const { appendBookingRowToSheet } = await import("@/lib/ops/googleSheets");

        (prisma.bookingJob.findMany as jest.Mock).mockResolvedValueOnce([
            { id: "j2", bookingId: "b1", type: "GOOGLE_SHEETS", attempts: 0 },
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
            pdfPath: "/tmp/inv.pdf",
        });

        await processPostBookingJobs({ limit: 10 });

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

        await processPostBookingJobs({ bookingId: "b1", limit: 2 });

        expect(prisma.bookingJob.findMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({ bookingId: "b1" }),
                take: 2,
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
});

