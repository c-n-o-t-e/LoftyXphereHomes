import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { recommendEditorialDesign } from "@/lib/content-studio/recommend";
import { recommendBodySchema } from "@/lib/content-studio/validation";
import { parseJsonBody } from "@/lib/validation/http";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

export async function POST(request: NextRequest) {
    try {
        await requireAdmin(request, ["admin"]);
        const parsed = await parseJsonBody(request, recommendBodySchema);
        if (!parsed.success) return parsed.response;

        const recommendation = recommendEditorialDesign(parsed.data);
        return NextResponse.json({ ok: true, recommendation });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to recommend" },
            { status: statusCode ?? 500 },
        );
    }
}
