import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { parseJsonBody } from "@/lib/validation/http";
import { adminUpdateStaffRoleBodySchema } from "@/lib/validation/schemas";
import { removeStaffUser, updateStaffRole } from "@/lib/admin/users";

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

function routeParamId(request: NextRequest): string {
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
}

export async function PATCH(request: NextRequest) {
    let admin;
    try {
        admin = await requireAdminOnly(request);
    } catch (res) {
        return res as Response;
    }

    const parsed = await parseJsonBody(request, adminUpdateStaffRoleBodySchema);
    if (!parsed.success) return parsed.response;

    const id = routeParamId(request);
    if (!id) {
        return NextResponse.json({ error: "Missing staff user id" }, { status: 400 });
    }

    try {
        const user = await updateStaffRole({
            actorSupabaseUserId: admin.supabaseUserId,
            staffId: id,
            nextRole: parsed.data.role,
        });
        return NextResponse.json({ ok: true, user });
    } catch (err) {
        const status = (err as RouteError).statusCode;
        if (status) {
            return NextResponse.json({ error: (err as Error).message }, { status });
        }
        console.error("admin update staff role failed:", err);
        return NextResponse.json({ error: "Failed to update staff role" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    let admin;
    try {
        admin = await requireAdminOnly(request);
    } catch (res) {
        return res as Response;
    }

    const id = routeParamId(request);
    if (!id) {
        return NextResponse.json({ error: "Missing staff user id" }, { status: 400 });
    }

    try {
        const result = await removeStaffUser({
            actorSupabaseUserId: admin.supabaseUserId,
            staffId: id,
        });
        return NextResponse.json({ ok: true, ...result });
    } catch (err) {
        const status = (err as RouteError).statusCode;
        if (status) {
            return NextResponse.json({ error: (err as Error).message }, { status });
        }
        console.error("admin remove staff user failed:", err);
        return NextResponse.json({ error: "Failed to remove staff user" }, { status: 500 });
    }
}

