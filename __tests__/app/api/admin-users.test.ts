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
        adminUser: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
            upsert: jest.fn(),
            count: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

jest.mock("@supabase/supabase-js", () => ({
    createClient: jest.fn(),
}));

jest.mock("@/lib/supabase/server", () => ({
    createServerSupabaseClient: jest.fn(),
}));

const { prisma } = require("@/lib/db");
const { createClient } = require("@supabase/supabase-js");
const { createServerSupabaseClient } = require("@/lib/supabase/server");

const { GET: getUsers, POST: postUsers } = require("@/app/api/admin/users/route");
const { PATCH: patchUser, DELETE: deleteUser } = require("@/app/api/admin/users/[id]/route");

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
    init?: { method?: string; headers?: Record<string, string>; body?: string },
): NextRequest {
    const bodyText = init?.body ?? "";
    return {
        url,
        nextUrl: new URL(url),
        headers: makeHeaders(init?.headers),
        method: init?.method ?? "GET",
        async json() {
            return JSON.parse(bodyText);
        },
    } as unknown as NextRequest;
}

describe("Admin staff management API", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon_key";

        (createClient as jest.Mock).mockReturnValue({
            auth: {
                getUser: jest.fn().mockResolvedValue({
                    data: { user: { id: "actor_1", email: "admin@example.com" } },
                    error: null,
                }),
            },
        });

        (createServerSupabaseClient as jest.Mock).mockReturnValue({
            auth: {
                admin: {
                    listUsers: jest.fn().mockResolvedValue({
                        data: { users: [] },
                        error: null,
                    }),
                    inviteUserByEmail: jest.fn().mockResolvedValue({
                        data: { user: { id: "new_user_1", email: "staff@example.com" } },
                        error: null,
                    }),
                    deleteUser: jest.fn().mockResolvedValue({ data: {}, error: null }),
                },
            },
        });
    });

    it("forbids receptionist from listing staff users", async () => {
        (prisma.adminUser.findFirst as jest.Mock).mockResolvedValueOnce({
            supabaseUserId: "actor_1",
            email: "admin@example.com",
            role: "receptionist",
        });

        const req = makeNextRequest("http://localhost/api/admin/users", {
            method: "GET",
            headers: { authorization: "Bearer token" },
        });
        const res = await getUsers(req);
        const json = await res.json();
        expect(res.status).toBe(403);
        expect(json.error).toBe("Forbidden");
    });

    it("invites/upserts a staff user for admin", async () => {
        (prisma.adminUser.findFirst as jest.Mock).mockResolvedValueOnce({
            supabaseUserId: "actor_1",
            email: "admin@example.com",
            role: "admin",
        });

        (prisma.adminUser.upsert as jest.Mock).mockResolvedValueOnce({
            id: "adm_row_1",
            supabaseUserId: "new_user_1",
            email: "staff@example.com",
            role: "receptionist",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
        });

        const req = makeNextRequest("http://localhost/api/admin/users", {
            method: "POST",
            headers: {
                authorization: "Bearer token",
                "content-type": "application/json",
            },
            body: JSON.stringify({ email: "staff@example.com", role: "receptionist" }),
        });
        const res = await postUsers(req);
        const json = await res.json();
        expect(res.status).toBe(200);
        expect(json.ok).toBe(true);
        expect(json.user.email).toBe("staff@example.com");
        expect(prisma.adminUser.upsert).toHaveBeenCalled();
    });

    it("prevents admin from removing their own access", async () => {
        (prisma.adminUser.findFirst as jest.Mock).mockResolvedValueOnce({
            supabaseUserId: "actor_1",
            email: "admin@example.com",
            role: "admin",
        });

        (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
            id: "adm_row_actor",
            supabaseUserId: "actor_1",
            email: "admin@example.com",
            role: "admin",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
        });

        const req = makeNextRequest("http://localhost/api/admin/users/adm_row_actor", {
            method: "DELETE",
            headers: { authorization: "Bearer token" },
        });
        const res = await deleteUser(req);
        const json = await res.json();
        expect(res.status).toBe(400);
        expect(json.error).toMatch(/own access/i);
    });

    it("prevents demoting the last remaining admin", async () => {
        (prisma.adminUser.findFirst as jest.Mock).mockResolvedValueOnce({
            supabaseUserId: "actor_1",
            email: "admin@example.com",
            role: "admin",
        });

        (prisma.adminUser.findUnique as jest.Mock).mockResolvedValueOnce({
            id: "adm_row_2",
            supabaseUserId: "other_admin",
            email: "other@example.com",
            role: "admin",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
        });

        (prisma.adminUser.count as jest.Mock).mockResolvedValueOnce(1);

        const req = makeNextRequest("http://localhost/api/admin/users/adm_row_2", {
            method: "PATCH",
            headers: {
                authorization: "Bearer token",
                "content-type": "application/json",
            },
            body: JSON.stringify({ role: "receptionist" }),
        });
        const res = await patchUser(req);
        const json = await res.json();
        expect(res.status).toBe(409);
        expect(json.error).toMatch(/last remaining admin/i);
    });
});

