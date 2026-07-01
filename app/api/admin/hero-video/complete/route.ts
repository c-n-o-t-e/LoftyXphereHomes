import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    completeHeroVideoDirectUpload,
    serializeHeroVideo,
} from "@/lib/admin/heroVideo";
import { parseJsonBody } from "@/lib/validation/http";
import { z } from "zod";

export const maxDuration = 300;

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

const completeUploadBodySchema = z
    .object({
        heroId: z.string().trim().min(1),
        mobileMimeType: z.string().trim().min(1).max(100),
        desktopMimeType: z.string().trim().min(1).max(100),
    })
    .strict();

function routeErrorResponse(err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message =
        err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: statusCode });
}

export async function POST(request: NextRequest) {
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

    const parsed = await parseJsonBody(request, completeUploadBodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const row = await completeHeroVideoDirectUpload({
            heroId: parsed.data.heroId,
            mobileMimeType: parsed.data.mobileMimeType,
            desktopMimeType: parsed.data.desktopMimeType,
        });
        return NextResponse.json({
            ok: true,
            heroVideo: serializeHeroVideo(row),
        });
    } catch (err) {
        console.error("Failed to complete hero video upload:", err);
        return routeErrorResponse(err);
    }
}
