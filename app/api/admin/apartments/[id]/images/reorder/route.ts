import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    reorderApartmentImages,
    serializeApartmentImage,
} from "@/lib/admin/apartmentImages";
import { parseJsonBody } from "@/lib/validation/http";
import { adminApartmentImagesReorderBodySchema } from "@/lib/validation/schemas";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ id: string }>;
};

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

    const { id: apartmentId } = await context.params;
    const parsed = await parseJsonBody(
        request,
        adminApartmentImagesReorderBodySchema,
    );
    if (!parsed.success) return parsed.response;

    try {
        const images = await reorderApartmentImages({
            apartmentId,
            imageIds: parsed.data.imageIds,
        });
        return NextResponse.json({
            ok: true,
            images: images.map(serializeApartmentImage),
        });
    } catch (err) {
        console.error("Failed to reorder apartment images:", err);
        return routeErrorResponse(err);
    }
}
