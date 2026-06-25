import {
    extractPaystackRefundReference,
    tryClaimRefundProcessing,
} from "@/lib/booking/refund";

jest.mock("@/lib/db", () => ({
    prisma: {
        booking: {
            updateMany: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

const { prisma } = require("@/lib/db");

describe("extractPaystackRefundReference", () => {
    it("reads top-level id from Paystack refund payload", () => {
        expect(extractPaystackRefundReference({ id: 12345 })).toBe("12345");
    });

    it("reads nested transaction id when present", () => {
        expect(
            extractPaystackRefundReference({ transaction: { id: "rf_abc" } }),
        ).toBe("rf_abc");
    });

    it("returns null for unexpected shapes", () => {
        expect(extractPaystackRefundReference(null)).toBeNull();
        expect(extractPaystackRefundReference({ status: true })).toBeNull();
    });
});

describe("tryClaimRefundProcessing", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("claims when refundStatus is NONE or FAILED", async () => {
        prisma.booking.updateMany.mockResolvedValueOnce({ count: 1 });

        await expect(tryClaimRefundProcessing("ref_1")).resolves.toEqual({
            action: "claimed",
        });

        expect(prisma.booking.updateMany).toHaveBeenCalledWith(
            expect.objectContaining({
                where: expect.objectContaining({
                    reference: "ref_1",
                    refundStatus: { in: ["NONE", "FAILED"] },
                }),
                data: { refundStatus: "PENDING" },
            }),
        );
    });

    it("returns already_refunded when row is REFUNDED", async () => {
        prisma.booking.updateMany.mockResolvedValue({ count: 0 });
        prisma.booking.findUnique.mockResolvedValueOnce({
            refundStatus: "REFUNDED",
        });

        await expect(tryClaimRefundProcessing("ref_2")).resolves.toEqual({
            action: "already_refunded",
        });
    });

    it("returns blocked when another handler holds PENDING", async () => {
        prisma.booking.updateMany.mockResolvedValue({ count: 0 });
        prisma.booking.findUnique.mockResolvedValueOnce({
            refundStatus: "PENDING",
        });

        await expect(tryClaimRefundProcessing("ref_3")).resolves.toEqual({
            action: "blocked",
        });
    });
});
