import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { initPropertyAmenityImageDirectUpload } from "@/lib/admin/propertyAmenityImages";
import { parseJsonBody } from "@/lib/validation/http";
import { z } from "zod";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ id: string }>;
};

const initUploadBodySchema = z
    .object({
        fileName: z.string().trim().min(1).max(255),
        mimeType: z.string().trim().min(1).max(100),
        fileSize: z.number().int().positive(),
    })
    .strict();

function routeErrorResponse(err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message =
        err instanceof Error ? err.message : "Unexpected server error";
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

    const { id: amenityId } = await context.params;
    const parsed = await parseJsonBody(request, initUploadBodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const upload = await initPropertyAmenityImageDirectUpload({
            amenityId,
            mimeType: parsed.data.mimeType,
            fileSize: parsed.data.fileSize,
        });

        return NextResponse.json({ ok: true, upload });
    } catch (err) {
        console.error("Failed to init property amenity image upload:", err);
        return routeErrorResponse(err);
    }
}
