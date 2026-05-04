/* eslint-disable @typescript-eslint/no-require-imports */
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
}));

jest.mock("@/lib/db", () => ({
    prisma: {
        booking: {
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        adminUser: {
            findFirst: jest.fn(),
        },
    },
}));

jest.mock("@supabase/supabase-js", () => ({
    createClient: jest.fn(),
}));

jest.mock("@/lib/ops/googleSheets", () => ({
    setStayedByInvoiceId: jest.fn(),
}));

const { POST: postAdminCancel } = require("@/app/api/admin/bookings/cancel/route");
const { prisma } = require("@/lib/db");
const { createClient } = require("@supabase/supabase-js");
const { setStayedByInvoiceId } = require("@/lib/ops/googleSheets");

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
            for (const entry of normalized.entries()) {
                yield entry;
            }
        },
    };
}

function makeNextRequest(
    url: string,
    init?: { method?: string; headers?: Record<string, string>; body?: string },
): NextRequest {
    const bodyText = init?.body ?? "";
    return {
        url,
        nextUrl: new URL(url),
        headers: makeHeaders(init?.headers),
        method: init?.method ?? "POST",
        async json() {
            return JSON.parse(bodyText);
        },
    } as unknown as NextRequest;
}

describe("POST /api/admin/bookings/cancel", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon_key";
        (createClient as jest.Mock).mockReturnValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: "admin_user_1", email: "admin@example.com" } },
                    error: null,
                }),
            },
        });
        (prisma.adminUser.findFirst as jest.Mock).mockResolvedValue({
            supabaseUserId: "admin_user_1",
            email: "admin@example.com",
            role: "admin",
        });
    });

    it("forbids receptionist users from cancelling bookings", async () => {
        (prisma.adminUser.findFirst as jest.Mock).mockResolvedValueOnce({
            supabaseUserId: "reception_user_1",
            email: "reception@example.com",
            role: "receptionist",
        });
        const request = makeNextRequest("http://localhost/api/admin/bookings/cancel", {
            method: "POST",
            headers: {
                authorization: "Bearer token",
                "content-type": "application/json",
            },
            body: JSON.stringify({ invoiceId: "LXH-260101-ABCDEF" }),
        });

        const res = await postAdminCancel(request);
        const json = await res.json();

        expect(res.status).toBe(403);
        expect(json.error).toBe("Forbidden");
        expect(prisma.booking.findFirst).not.toHaveBeenCalled();
    });

    it("returns 400 when invoice id cannot be parsed", async () => {
        const request = makeNextRequest("http://localhost/api/admin/bookings/cancel", {
            method: "POST",
            headers: {
                authorization: "Bearer token",
                "content-type": "application/json",
            },
            body: JSON.stringify({ invoiceId: "no valid lxh id" }),
        });
        const res = await postAdminCancel(request);
        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.code).toBe("INVALID_INVOICE_INPUT");
    });

    it("returns 404 when booking not found", async () => {
        (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce(null);
        const request = makeNextRequest("http://localhost/api/admin/bookings/cancel", {
            method: "POST",
            headers: {
                authorization: "Bearer token",
                "content-type": "application/json",
            },
            body: JSON.stringify({ invoiceId: "LXH-260101-ABCDEF" }),
        });
        const res = await postAdminCancel(request);
        expect(res.status).toBe(404);
    });

    it("returns 200 when already cancelled", async () => {
        (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce({
            id: "b1",
            status: "CANCELLED",
            invoiceId: "LXH-260101-ABCDEF",
        });
        const request = makeNextRequest("http://localhost/api/admin/bookings/cancel", {
            method: "POST",
            headers: {
                authorization: "Bearer token",
                "content-type": "application/json",
            },
            body: JSON.stringify({ invoiceId: "LXH-260101-ABCDEF" }),
        });
        const res = await postAdminCancel(request);
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.alreadyCancelled).toBe(true);
        expect(setStayedByInvoiceId).not.toHaveBeenCalled();
    });

    it("cancels booking and updates Sheets", async () => {
        (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce({
            id: "b1",
            status: "PAID",
            invoiceId: "LXH-260101-ABCDEF",
        });
        (setStayedByInvoiceId as jest.Mock).mockResolvedValueOnce({
            sheetTitle: "June 2026",
            rowNumber: 12,
        });
        const request = makeNextRequest("http://localhost/api/admin/bookings/cancel", {
            method: "POST",
            headers: {
                authorization: "Bearer token",
                "content-type": "application/json",
            },
            body: JSON.stringify({ invoiceId: "LXH-260101-ABCDEF" }),
        });
        const res = await postAdminCancel(request);
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.ok).toBe(true);
        expect(prisma.booking.update).toHaveBeenCalledWith({
            where: { id: "b1" },
            data: { status: "CANCELLED" },
        });
        expect(setStayedByInvoiceId).toHaveBeenCalledWith({
            invoiceId: "LXH-260101-ABCDEF",
            stayed: false,
        });
        expect(json.sheetTitle).toBe("June 2026");
    });

    it("returns 200 with warning when Sheets row missing", async () => {
        (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce({
            id: "b1",
            status: "PAID",
            invoiceId: "LXH-260101-ABCDEF",
        });
        const err = new Error("Invoice ID not found in Google Sheet");
        (err as { statusCode?: number }).statusCode = 404;
        (setStayedByInvoiceId as jest.Mock).mockRejectedValueOnce(err);
        const request = makeNextRequest("http://localhost/api/admin/bookings/cancel", {
            method: "POST",
            headers: {
                authorization: "Bearer token",
                "content-type": "application/json",
            },
            body: JSON.stringify({ invoiceId: "LXH-260101-ABCDEF" }),
        });
        const res = await postAdminCancel(request);
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.code).toBe("SHEETS_ROW_NOT_FOUND");
        expect(json.warning).toBeTruthy();
    });

    it("reverts booking status when Sheets fails non-404", async () => {
        (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce({
            id: "b1",
            status: "PAID",
            invoiceId: "LXH-260101-ABCDEF",
        });
        (setStayedByInvoiceId as jest.Mock).mockRejectedValueOnce(new Error("network"));
        const request = makeNextRequest("http://localhost/api/admin/bookings/cancel", {
            method: "POST",
            headers: {
                authorization: "Bearer token",
                "content-type": "application/json",
            },
            body: JSON.stringify({ invoiceId: "LXH-260101-ABCDEF" }),
        });
        const res = await postAdminCancel(request);
        expect(res.status).toBe(502);
        expect(prisma.booking.update).toHaveBeenCalledWith({
            where: { id: "b1" },
            data: { status: "PAID" },
        });
    });
});
