import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    completePropertyAmenityImageDirectUpload,
    serializePropertyAmenityImage,
} from "@/lib/admin/propertyAmenityImages";
import { parseJsonBody } from "@/lib/validation/http";
import { z } from "zod";

export const maxDuration = 120;

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
        altText: z.string().trim().max(200).nullable().optional(),
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
    const parsed = await parseJsonBody(request, completeUploadBodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const row = await completePropertyAmenityImageDirectUpload({
            amenityId,
            imageId: parsed.data.imageId,
            mimeType: parsed.data.mimeType,
            altText: parsed.data.altText,
        });

        return NextResponse.json({
            ok: true,
            image: serializePropertyAmenityImage(row),
        });
    } catch (err) {
        console.error("Failed to complete property amenity image upload:", err);
        return routeErrorResponse(err);
    }
}
