import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { duplicatePostTemplateForAdmin } from "@/lib/admin/postTemplates";

type RouteContext = { params: Promise<{ id: string }> };

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        const admin = await requireAdmin(request, ["admin"]);
        const { id } = await context.params;
        const template = await duplicatePostTemplateForAdmin(id, admin.email);
        return NextResponse.json({ ok: true, template }, { status: 201 });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        const status = statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Duplicate failed" },
            { status },
        );
    }
}
