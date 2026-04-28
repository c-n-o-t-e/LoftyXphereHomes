import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export async function GET(request: NextRequest) {
    try {
        const admin = await requireAdmin(request, ["admin", "receptionist"]);
        return NextResponse.json({ ok: true, role: admin.role, email: admin.email });
    } catch (err) {
        const httpResponse = (err as any)?.httpResponse;
        if (httpResponse) return httpResponse;
        const status = (err as any)?.statusCode ?? 401;
        return NextResponse.json(
            { ok: false, error: status === 403 ? "Forbidden" : "Unauthorized" },
            { status },
        );
    }
}

