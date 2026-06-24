import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    deletePropertyAmenityImage,
    reorderPropertyAmenityImages,
    serializePropertyAmenityImage,
} from "@/lib/admin/propertyAmenityImages";
import { prisma } from "@/lib/db";
import { parseJsonBody } from "@/lib/validation/http";
import { z } from "zod";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ id: string }>;
};

const reorderBodySchema = z
    .object({
        imageIds: z.array(z.string().trim().min(1)).min(1),
    })
    .strict();

function routeErrorResponse(err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message =
        err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: statusCode });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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
    const parsed = await parseJsonBody(request, reorderBodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const images = await reorderPropertyAmenityImages({
            amenityId,
            imageIds: parsed.data.imageIds,
        });
        return NextResponse.json({
            ok: true,
            images: images.map(serializePropertyAmenityImage),
        });
    } catch (err) {
        console.error("Failed to reorder property amenity images:", err);
        return routeErrorResponse(err);
    }
}
