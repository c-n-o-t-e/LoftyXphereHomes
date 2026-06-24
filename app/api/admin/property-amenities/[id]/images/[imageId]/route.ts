import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    deletePropertyAmenityImage,
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
    params: Promise<{ id: string; imageId: string }>;
};

const patchBodySchema = z
    .object({
        altText: z.string().trim().max(200).nullable().optional(),
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

    const { id: amenityId, imageId } = await context.params;
    const parsed = await parseJsonBody(request, patchBodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const existing = await prisma.propertyAmenityImage.findFirst({
            where: { id: imageId, amenityId },
        });
        if (!existing) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        const updated = await prisma.propertyAmenityImage.update({
            where: { id: imageId },
            data: {
                altText:
                    parsed.data.altText === undefined
                        ? existing.altText
                        : parsed.data.altText,
            },
        });

        return NextResponse.json({
            ok: true,
            image: serializePropertyAmenityImage(updated),
        });
    } catch (err) {
        console.error("Failed to update property amenity image:", err);
        return routeErrorResponse(err);
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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

    const { id: amenityId, imageId } = await context.params;

    try {
        const deleted = await deletePropertyAmenityImage({ amenityId, imageId });
        return NextResponse.json({
            ok: true,
            image: serializePropertyAmenityImage(deleted),
        });
    } catch (err) {
        console.error("Failed to delete property amenity image:", err);
        return routeErrorResponse(err);
    }
}
