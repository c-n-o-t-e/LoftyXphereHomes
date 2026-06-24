import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    getPropertyAmenityById,
    updatePropertyAmenity,
} from "@/lib/admin/propertyAmenities";
import { parseJsonBody } from "@/lib/validation/http";
import { z } from "zod";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ id: string }>;
};

const patchBodySchema = z
    .object({
        name: z.string().trim().min(1).max(120).optional(),
        shortDescription: z.string().trim().min(1).max(280).optional(),
        description: z.string().trim().max(4000).nullable().optional(),
        isPublished: z.boolean().optional(),
    })
    .strict();

function routeErrorResponse(err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message =
        err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: statusCode });
}

export async function GET(request: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;
    const amenity = await getPropertyAmenityById(id);
    if (!amenity) {
        return NextResponse.json({ error: "Property amenity not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, amenity });
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

    const { id } = await context.params;
    const parsed = await parseJsonBody(request, patchBodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const amenity = await updatePropertyAmenity({
            amenityId: id,
            ...parsed.data,
        });
        return NextResponse.json({ ok: true, amenity });
    } catch (err) {
        console.error("Failed to update property amenity:", err);
        return routeErrorResponse(err);
    }
}
