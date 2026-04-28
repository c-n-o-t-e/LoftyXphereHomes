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
        expect(appendBookingRowToSheet).toHaveBeenCalled();
        expect(prisma.bookingJob.update).toHaveBeenCalledTimes(2);
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
});

