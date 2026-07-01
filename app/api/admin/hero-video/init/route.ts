import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { initHeroVideoPairUpload } from "@/lib/admin/heroVideo";
import { parseJsonBody } from "@/lib/validation/http";
import { z } from "zod";

export const maxDuration = 120;

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

const uploadMetaSchema = z
    .object({
        fileName: z.string().trim().min(1).max(255),
        mimeType: z.string().trim().min(1).max(100),
        fileSize: z.number().int().positive(),
    })
    .strict();

const initUploadBodySchema = z
    .object({
        mobile: uploadMetaSchema,
        desktop: uploadMetaSchema,
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

    const parsed = await parseJsonBody(request, initUploadBodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const upload = await initHeroVideoPairUpload({
            mobile: {
                mimeType: parsed.data.mobile.mimeType,
                fileSize: parsed.data.mobile.fileSize,
            },
            desktop: {
                mimeType: parsed.data.desktop.mimeType,
                fileSize: parsed.data.desktop.fileSize,
            },
        });
        return NextResponse.json({ ok: true, upload });
    } catch (err) {
        console.error("Failed to init hero video upload:", err);
        return routeErrorResponse(err);
    }
}
