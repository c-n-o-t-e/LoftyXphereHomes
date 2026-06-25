import type { NextRequest } from "next/server";
import { BookingDateConflictError } from "@/lib/booking";
import { computeBookingQuote, totalNgnToKobo } from "@/lib/pricing";

jest.mock("next/server", () => ({
    NextResponse: {
        json: (body: unknown, init?: { status?: number }) => ({
            status: init?.status ?? 200,
            async json() {
                return body;
            },
        }),
    },
    after: jest.fn((fn: () => void | Promise<void>) => {
        if (typeof fn === "function") void fn();
    }),
}));

jest.mock("@/lib/paystack", () => ({
    verifyTransaction: jest.fn(),
    verifyWebhookSignature: jest.fn(),
    initiateRefund: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
    prisma: {
        booking: {
            upsert: jest.fn(),
            updateMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    },
}));

jest.mock("@/lib/booking/conflict", () => {
    const actual = jest.requireActual("@/lib/booking/conflict");
    return {
        ...actual,
        withApartmentBookingTransaction: jest.fn(
            (_apartmentId: string, fn: (tx: unknown) => unknown) =>
                fn({
                    booking: {
                        findUnique: jest.fn(),
                        update: jest.fn(),
                        create: jest.fn(),
                    },
                }),
        ),
        findOverlappingBooking: jest.fn(),
    };
});

jest.mock("@/lib/email/admin-alerts", () => ({
    sendAdminAlertBookingConflictRefund: jest.fn(),
    sendAdminAlertBookingPersistenceFailed: jest.fn(),
}));

jest.mock("@/lib/ops/bookingJobs", () => ({
    enqueuePostBookingJobs: jest.fn(),
    flushPostBookingJobsForBooking: jest.fn(),
}));

jest.mock("@/lib/supabase/server", () => ({
    inviteUserByEmail: jest.fn(),
}));

const { POST: postPaystackWebhook } = require("@/app/api/paystack/webhook/route");
const { verifyTransaction, verifyWebhookSignature, initiateRefund } =
    require("@/lib/paystack");
const { prisma } = require("@/lib/db");
const { withApartmentBookingTransaction, findOverlappingBooking } =
    require("@/lib/booking/conflict");
const { sendAdminAlertBookingConflictRefund } = require("@/lib/email/admin-alerts");

function makeWebhookRequest(reference: string) {
    return {
        headers: {
            get: (name: string) =>
                name.toLowerCase() === "x-paystack-signature" ? "valid_sig" : null,
        },
        text: async () =>
            JSON.stringify({
                event: "charge.success",
                data: { reference },
            }),
    } as unknown as NextRequest;
}

const checkIn = "2026-08-10";
const checkOut = "2026-08-14";
const quote = computeBookingQuote(100_000, checkIn, checkOut);
if (!quote) throw new Error("test quote setup failed");

const paystackPayload = {
    reference: "ref_conflict_replay",
    status: "success" as const,
    amount: totalNgnToKobo(quote.totalNgn),
    metadata: {
        apartment_id: "lofty-horizon-suite",
        check_in: checkIn,
        check_out: checkOut,
    },
    customer: { email: "guest@example.com" },
};

describe("Paystack webhook refund replay", () => {
    const mockTx = {
        booking: {
            findUnique: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (verifyWebhookSignature as jest.Mock).mockReturnValue(true);
        (verifyTransaction as jest.Mock).mockResolvedValue({
            status: true,
            data: paystackPayload,
        });
        (withApartmentBookingTransaction as jest.Mock).mockImplementation(
            (_apartmentId: string, fn: (tx: typeof mockTx) => unknown) =>
                fn(mockTx),
        );
        mockTx.booking.findUnique.mockResolvedValue({
            id: "bk_pending",
            status: "PENDING",
            expiresAt: new Date(Date.now() + 60_000),
            bookerName: null,
            bookerPhone: null,
        });
        findOverlappingBooking.mockResolvedValue({
            id: "bk_other",
            reference: "ref_other",
        });
        prisma.booking.upsert.mockResolvedValue({ id: "audit" });
        prisma.booking.updateMany.mockResolvedValue({ count: 1 });
        prisma.booking.update.mockResolvedValue({ id: "audit" });
        (initiateRefund as jest.Mock).mockResolvedValue({
            ok: true,
            data: { id: "rf_123" },
        });
    });

    it("refunds once on first conflict webhook and skips refund on replay", async () => {
        const first = await postPaystackWebhook(
            makeWebhookRequest("ref_conflict_replay"),
        );
        const firstJson = await first.json();

        expect(first.status).toBe(200);
        expect(firstJson).toEqual(
            expect.objectContaining({
                received: true,
                conflictResolved: true,
                refundInitiated: true,
            }),
        );
        expect(initiateRefund).toHaveBeenCalledTimes(1);
        expect(sendAdminAlertBookingConflictRefund).toHaveBeenCalledTimes(1);

        prisma.booking.updateMany.mockResolvedValue({ count: 0 });
        prisma.booking.findUnique.mockResolvedValue({
            refundStatus: "REFUNDED",
        });

        const second = await postPaystackWebhook(
            makeWebhookRequest("ref_conflict_replay"),
        );
        const secondJson = await second.json();

        expect(second.status).toBe(200);
        expect(secondJson).toEqual(
            expect.objectContaining({
                received: true,
                conflictResolved: true,
                refundInitiated: true,
            }),
        );
        expect(initiateRefund).toHaveBeenCalledTimes(1);
        expect(sendAdminAlertBookingConflictRefund).toHaveBeenCalledTimes(1);
    });

    it("returns conflictResolved without throwing BookingDateConflictError to callers", async () => {
        const response = await postPaystackWebhook(
            makeWebhookRequest("ref_conflict_replay"),
        );
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json.conflictResolved).toBe(true);
        expect(BookingDateConflictError).toBeDefined();
    });
});
