import {
    BookingDateConflictError,
    upsertBookingFromPaystack,
} from "@/lib/booking";
import { computeBookingQuote, totalNgnToKobo } from "@/lib/pricing";
import type { PaystackVerifyData } from "@/lib/paystack";

const mockTx = {
    booking: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
    },
};

jest.mock("@/lib/db", () => ({
    prisma: {
        booking: {
            upsert: jest.fn(),
            updateMany: jest.fn(),
        },
    },
}));

jest.mock("@/lib/booking/conflict", () => {
    const actual = jest.requireActual("@/lib/booking/conflict");
    return {
        ...actual,
        withApartmentBookingTransaction: jest.fn((_apartmentId: string, fn: (tx: typeof mockTx) => unknown) =>
            fn(mockTx),
        ),
        findOverlappingBooking: jest.fn(),
    };
});

jest.mock("@/lib/paystack", () => ({
    initiateRefund: jest.fn(),
}));

jest.mock("@/lib/email/admin-alerts", () => ({
    sendAdminAlertBookingConflictRefund: jest.fn(),
}));

const { prisma } = require("@/lib/db");
const { withApartmentBookingTransaction, findOverlappingBooking } =
    require("@/lib/booking/conflict");
const { initiateRefund } = require("@/lib/paystack");
const { sendAdminAlertBookingConflictRefund } = require("@/lib/email/admin-alerts");

describe("upsertBookingFromPaystack", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("rejects non-successful Paystack transactions", async () => {
        const data: PaystackVerifyData = {
            reference: "ref_failed",
            status: "failed",
            amount: 100_00,
            metadata: {
                apartment_id: "lofty-horizon-suite",
                check_in: "2026-03-20",
                check_out: "2026-03-24",
            },
            customer: { email: "a@b.com" },
        };

        await expect(upsertBookingFromPaystack(data)).rejects.toThrow(
            /non-successful Paystack transaction/,
        );
        expect(withApartmentBookingTransaction).not.toHaveBeenCalled();
    });

    it("rejects when Paystack amount does not match server-computed price", async () => {
        const checkIn = "2026-03-20";
        const checkOut = "2026-03-24";
        const quote = computeBookingQuote(100_000, checkIn, checkOut);
        expect(quote).not.toBeNull();
        const wrongKobo = totalNgnToKobo(quote!.totalNgn) - 100;

        const data: PaystackVerifyData = {
            reference: "ref_test",
            status: "success",
            amount: wrongKobo,
            metadata: {
                apartment_id: "lofty-horizon-suite",
                check_in: checkIn,
                check_out: checkOut,
            },
            customer: { email: "a@b.com" },
        };

        await expect(upsertBookingFromPaystack(data)).rejects.toThrow(
            /Payment amount does not match/,
        );
        expect(withApartmentBookingTransaction).not.toHaveBeenCalled();
    });

    it("upgrades an active PENDING hold to PAID", async () => {
        const checkIn = "2026-03-20";
        const checkOut = "2026-03-24";
        const quote = computeBookingQuote(100_000, checkIn, checkOut);
        expect(quote).not.toBeNull();
        const kobo = totalNgnToKobo(quote!.totalNgn);

        const data: PaystackVerifyData = {
            reference: "ref_ok",
            status: "success",
            amount: kobo,
            metadata: {
                apartment_id: "lofty-horizon-suite",
                check_in: checkIn,
                check_out: checkOut,
            },
            customer: { email: "a@b.com" },
        };

        mockTx.booking.findUnique.mockResolvedValueOnce({
            id: "bk_pending",
            status: "PENDING",
            expiresAt: new Date(Date.now() + 60_000),
            bookerName: null,
            bookerPhone: null,
        });
        findOverlappingBooking.mockResolvedValueOnce(null);
        mockTx.booking.update.mockResolvedValueOnce({
            id: "bk_pending",
            status: "PAID",
        });

        const booking = await upsertBookingFromPaystack(data);

        expect(booking.status).toBe("PAID");
        expect(mockTx.booking.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { reference: "ref_ok" },
                data: expect.objectContaining({ status: "PAID", expiresAt: null }),
            }),
        );
    });

    it("creates a PAID booking for legacy references without a hold", async () => {
        const checkIn = "2026-03-20";
        const checkOut = "2026-03-24";
        const quote = computeBookingQuote(100_000, checkIn, checkOut);
        expect(quote).not.toBeNull();
        const kobo = totalNgnToKobo(quote!.totalNgn);

        const data: PaystackVerifyData = {
            reference: "ref_legacy",
            status: "success",
            amount: kobo,
            metadata: {
                apartment_id: "lofty-horizon-suite",
                check_in: checkIn,
                check_out: checkOut,
            },
            customer: { email: "a@b.com" },
        };

        mockTx.booking.findUnique.mockResolvedValueOnce(null);
        findOverlappingBooking.mockResolvedValueOnce(null);
        mockTx.booking.create.mockResolvedValueOnce({
            id: "bk_legacy",
            status: "PAID",
        });

        const booking = await upsertBookingFromPaystack(data);

        expect(booking.status).toBe("PAID");
        expect(mockTx.booking.create).toHaveBeenCalledWith(
            expect.objectContaining({
                data: expect.objectContaining({ status: "PAID", reference: "ref_legacy" }),
            }),
        );
    });

    it("refunds and alerts when dates conflict during confirmation", async () => {
        const checkIn = "2026-03-20";
        const checkOut = "2026-03-24";
        const quote = computeBookingQuote(100_000, checkIn, checkOut);
        expect(quote).not.toBeNull();
        const kobo = totalNgnToKobo(quote!.totalNgn);

        const data: PaystackVerifyData = {
            reference: "ref_conflict",
            status: "success",
            amount: kobo,
            metadata: {
                apartment_id: "lofty-horizon-suite",
                check_in: checkIn,
                check_out: checkOut,
            },
            customer: { email: "a@b.com" },
        };

        mockTx.booking.findUnique.mockResolvedValueOnce({
            id: "bk_pending",
            status: "PENDING",
            expiresAt: new Date(Date.now() + 60_000),
            bookerName: null,
            bookerPhone: null,
        });
        findOverlappingBooking.mockResolvedValueOnce({
            id: "bk_other",
            reference: "ref_other",
        });
        initiateRefund.mockResolvedValueOnce({ ok: true });
        prisma.booking.upsert.mockResolvedValueOnce({ id: "audit" });

        await expect(upsertBookingFromPaystack(data)).rejects.toBeInstanceOf(
            BookingDateConflictError,
        );

        expect(initiateRefund).toHaveBeenCalledWith({
            transaction: "ref_conflict",
            amount: kobo,
        });
        expect(sendAdminAlertBookingConflictRefund).toHaveBeenCalledWith(
            expect.objectContaining({
                reference: "ref_conflict",
                refundInitiated: true,
            }),
        );
    });
});
