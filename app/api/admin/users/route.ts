import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { parseJsonBody } from "@/lib/validation/http";
import { adminUpsertStaffUserBodySchema } from "@/lib/validation/schemas";
import { listStaffUsers, upsertStaffUser } from "@/lib/admin/users";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
    message?: string;
};

async function requireAdminOnly(request: NextRequest) {
    try {
        return await requireAdmin(request, ["admin"]);
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) throw httpResponse;
        throw NextResponse.json(
            { error: statusCode === 403 ? "Forbidden" : "Unauthorized" },
            { status: statusCode ?? 401 },
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        await requireAdminOnly(request);
    } catch (res) {
        return res as Response;
    }

    try {
        const users = await listStaffUsers();
        return NextResponse.json({ ok: true, users });
    } catch (err) {
        console.error("admin list users failed:", err);
        return NextResponse.json({ error: "Failed to list staff users" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdminOnly(request);
    } catch (res) {
        return res as Response;
    }

    const parsed = await parseJsonBody(request, adminUpsertStaffUserBodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const user = await upsertStaffUser({
            email: parsed.data.email,
            role: parsed.data.role,
        });
        return NextResponse.json({ ok: true, user });
    } catch (err) {
        console.error("admin upsert staff user failed:", err);
        return NextResponse.json({ error: "Failed to add staff user" }, { status: 500 });
    }
}

