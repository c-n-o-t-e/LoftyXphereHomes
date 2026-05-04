/* eslint-disable @typescript-eslint/no-require-imports */
import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
    NextResponse: {
        json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
            status: init?.status ?? 200,
            headers: init?.headers ?? {},
            async json() {
                return body;
            },
        }),
    },
}));

jest.mock("@/lib/db", () => ({
    prisma: {
        booking: {
            findMany: jest.fn(),
        },
        adminUser: {
            findFirst: jest.fn(),
        },
    },
}));

jest.mock("@supabase/supabase-js", () => ({
    createClient: jest.fn(),
}));

const { GET: getAdminBookings } = require("@/app/api/admin/bookings/route");
const { prisma } = require("@/lib/db");
const { createClient } = require("@supabase/supabase-js");

type HeaderBag = {
    get: (name: string) => string | null;
    entries: () => IterableIterator<[string, string]>;
};

function makeHeaders(input?: Record<string, string>): HeaderBag {
    const normalized = new Map<string, string>();
    for (const [key, value] of Object.entries(input ?? {})) {
        normalized.set(key.toLowerCase(), value);
    }
    return {
        get: (name: string) => normalized.get(name.toLowerCase()) ?? null,
        entries: function* () {
            for (const entry of normalized.entries()) yield entry;
        },
    };
}

function makeNextRequest(
    url: string,
    init?: { method?: string; headers?: Record<string, string> },
): NextRequest {
    return {
        url,
        nextUrl: new URL(url),
        headers: makeHeaders(init?.headers),
        method: init?.method ?? "GET",
    } as unknown as NextRequest;
}

describe("GET /api/admin/bookings", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon_key";
        (createClient as jest.Mock).mockReturnValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: "staff_1", email: "staff@example.com" } },
                    error: null,
                }),
            },
        });
        (prisma.adminUser.findFirst as jest.Mock).mockResolvedValue({
            supabaseUserId: "staff_1",
            email: "staff@example.com",
            role: "receptionist",
        });
        (prisma.booking.findMany as jest.Mock).mockResolvedValue([]);
    });

    it("returns 400 when missing Authorization header", async () => {
        const request = makeNextRequest("http://localhost/api/admin/bookings?view=current");
        const res = await getAdminBookings(request);
        const json = await res.json();

        expect(res.status).toBe(400);
        expect(json.error).toBe("Validation failed");
    });

    it("allows receptionist and returns ok payload with no-store headers", async () => {
        (prisma.booking.findMany as jest.Mock).mockResolvedValueOnce([
            {
                id: "b1",
                reference: "ref_1",
                apartmentId: "lofty-wuye-01",
                checkIn: new Date("2026-04-20T00:00:00.000Z"),
                checkOut: new Date("2026-04-22T00:00:00.000Z"),
                nights: 2,
                amountPaid: 100_000,
                currency: "NGN",
                status: "PAID",
                source: "WEBSITE",
                bookerEmail: "guest@example.com",
                bookerName: "Jane Doe",
                bookerPhone: "+2348000000000",
                createdAt: new Date("2026-04-01T10:00:00.000Z"),
                invoiceId: "LXH-260401-ABCDEF",
                invoicePdfPath: null,
            },
        ]);

        const request = makeNextRequest("http://localhost/api/admin/bookings?view=current", {
            headers: { authorization: "Bearer token" },
        });
        const res = await getAdminBookings(request);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(res.headers?.["Cache-Control"]).toBe("private, no-store");
        expect(json.ok).toBe(true);
        expect(json.bookings).toHaveLength(1);
        expect(json.bookings[0].invoiceReady).toBe(false);
        expect(json.bookings[0].amountPaid).toBeUndefined();
        expect(json.bookings[0].currency).toBeUndefined();
        expect(json.bookings[0].bookerEmail).toBeUndefined();
        expect(json.bookings[0].bookerPhone).toBeUndefined();
        expect(typeof json.bookings[0].bookerEmailMasked).toBe("string");
        expect(typeof json.bookings[0].bookerPhoneMasked).toBe("string");
    });

    it("returns finance + contact fields for admin users", async () => {
        (prisma.adminUser.findFirst as jest.Mock).mockResolvedValueOnce({
            supabaseUserId: "staff_1",
            email: "staff@example.com",
            role: "admin",
        });
        (prisma.booking.findMany as jest.Mock).mockResolvedValueOnce([
            {
                id: "b1",
                reference: "ref_1",
                apartmentId: "lofty-wuye-01",
                checkIn: new Date("2026-04-20T00:00:00.000Z"),
                checkOut: new Date("2026-04-22T00:00:00.000Z"),
                nights: 2,
                amountPaid: 100_000,
                currency: "NGN",
                status: "PAID",
                source: "WEBSITE",
                bookerEmail: "guest@example.com",
                bookerName: "Jane Doe",
                bookerPhone: "+2348000000000",
                createdAt: new Date("2026-04-01T10:00:00.000Z"),
                invoiceId: "LXH-260401-ABCDEF",
                invoicePdfPath: null,
            },
        ]);

        const request = makeNextRequest("http://localhost/api/admin/bookings?view=current", {
            headers: { authorization: "Bearer token" },
        });
        const res = await getAdminBookings(request);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.ok).toBe(true);
        expect(json.bookings[0].amountPaid).toBe(100_000);
        expect(json.bookings[0].currency).toBe("NGN");
        expect(json.bookings[0].bookerEmail).toBe("guest@example.com");
        expect(json.bookings[0].bookerPhone).toBe("+2348000000000");
    });

    it("parses invoice id from free text and includes resolvedInvoiceId", async () => {
        const request = makeNextRequest(
            "http://localhost/api/admin/bookings?view=all&q=Please%20cancel%20Invoice%20ID%3A%20LXH-260101-ABCDEF",
            {
                headers: { authorization: "Bearer token" },
            },
        );

        const res = await getAdminBookings(request);
        const json = await res.json();

        expect(res.status).toBe(200);
        expect(json.ok).toBe(true);
        expect(json.resolvedInvoiceId).toBe("LXH-260101-ABCDEF");

        const call = (prisma.booking.findMany as jest.Mock).mock.calls[0]?.[0];
        expect(call?.where?.OR).toBeTruthy();
    });

    it("applies current view date constraints", async () => {
        const request = makeNextRequest("http://localhost/api/admin/bookings?view=current", {
            headers: { authorization: "Bearer token" },
        });

        await getAdminBookings(request);

        const call = (prisma.booking.findMany as jest.Mock).mock.calls[0]?.[0];
        expect(call?.where?.checkIn?.lte).toBeInstanceOf(Date);
        expect(call?.where?.checkOut?.gt).toBeInstanceOf(Date);
        expect(call?.where?.status?.in).toEqual(["PAID", "PENDING"]);
    });
});

