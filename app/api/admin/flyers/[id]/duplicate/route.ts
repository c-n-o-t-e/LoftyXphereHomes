import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { duplicateFlyerForAdmin } from "@/lib/admin/flyers";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin(request, ["admin"]);
        const { id } = await context.params;
        const flyer = await duplicateFlyerForAdmin(id, admin.email);
        return NextResponse.json({ ok: true, flyer }, { status: 201 });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        const code = statusCode ?? (err as { statusCode?: number }).statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to duplicate flyer" },
            { status: code },
        );
    }
}
