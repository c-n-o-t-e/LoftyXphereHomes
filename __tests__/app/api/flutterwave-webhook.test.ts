import type { NextRequest } from "next/server";

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

jest.mock("@/lib/flutterwave", () => ({
    verifyWebhookHash: jest.fn(),
    verifyTransactionByReference: jest.fn(),
}));

jest.mock("@/lib/booking", () => {
    const actual = jest.requireActual("@/lib/booking");
    return {
        ...actual,
        confirmBookingFromPayment: jest.fn(),
    };
});

jest.mock("@/lib/ops/bookingJobs", () => ({
    enqueuePostBookingJobs: jest.fn(),
    flushPostBookingJobsForBooking: jest.fn(),
}));

jest.mock("@/lib/supabase/server", () => ({
    inviteUserByEmail: jest.fn().mockResolvedValue(undefined),
}));

const { POST: postFlutterwaveWebhook } = require("@/app/api/flutterwave/webhook/route");
const { verifyWebhookHash, verifyTransactionByReference } = require("@/lib/flutterwave");
const { confirmBookingFromPayment } = require("@/lib/booking");
const { enqueuePostBookingJobs } = require("@/lib/ops/bookingJobs");

function makeNextRequest(body: unknown, headers: Record<string, string> = {}): NextRequest {
    return {
        headers: {
            get: (name: string) => headers[name.toLowerCase()] ?? null,
        },
        async json() {
            return body;
        },
    } as unknown as NextRequest;
}

describe("Flutterwave webhook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns 401 when verif-hash is missing", async () => {
        const response = await postFlutterwaveWebhook(makeNextRequest({}));
        expect(response.status).toBe(401);
    });

    it("API-verifies before confirming booking", async () => {
        (verifyWebhookHash as jest.Mock).mockReturnValue(true);
        (verifyTransactionByReference as jest.Mock).mockResolvedValue({
            status: "success",
            data: {
                id: 999,
                tx_ref: "ref_fw",
                status: "successful",
                amount: 201_250,
                currency: "NGN",
                meta: {
                    apartment_id: "horizon-suite",
                    check_in: "2026-05-01",
                    check_out: "2026-05-03",
                },
                customer: { email: "guest@example.com" },
            },
        });
        (confirmBookingFromPayment as jest.Mock).mockResolvedValue({
            id: "booking_fw",
            status: "PAID",
            bookerEmail: "guest@example.com",
        });

        const response = await postFlutterwaveWebhook(
            makeNextRequest(
                {
                    event: "charge.completed",
                    data: { tx_ref: "ref_fw", status: "successful" },
                },
                { "verif-hash": "valid" },
            ),
        );

        expect(response.status).toBe(200);
        expect(verifyTransactionByReference).toHaveBeenCalledWith("ref_fw");
        expect(confirmBookingFromPayment).toHaveBeenCalledWith(
            expect.objectContaining({
                reference: "ref_fw",
                provider: "flutterwave",
            }),
        );
        expect(enqueuePostBookingJobs).toHaveBeenCalledWith("booking_fw");
    });
});
