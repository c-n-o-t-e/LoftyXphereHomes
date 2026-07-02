import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { completeFlyerImageDirectUpload } from "@/lib/admin/flyerImages";
import { parseJsonBody } from "@/lib/validation/http";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ id: string }>;
};

const completeUploadBodySchema = z
    .object({
        imageId: z.string().trim().min(1),
        mimeType: z.string().trim().min(1).max(100),
    })
    .strict();

function routeErrorResponse(err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: statusCode });
}

export async function POST(request: NextRequest, context: RouteContext) {
    try {
        await requireAdmin(request, ["admin"]);
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        const status = statusCode ?? 401;
        return NextResponse.json(
            { error: status === 403 ? "Forbidden" : "Unauthorized" },
            { status },
        );
    }

    const { id: flyerId } = await context.params;
    const parsed = await parseJsonBody(request, completeUploadBodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const image = await completeFlyerImageDirectUpload({
            flyerId,
            imageId: parsed.data.imageId,
            mimeType: parsed.data.mimeType,
        });
        return NextResponse.json({ ok: true, image });
    } catch (err) {
        console.error("Failed to complete flyer image upload:", err);
        return routeErrorResponse(err);
    }
}
