import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    deleteApartmentImage,
    replaceApartmentImageFile,
    serializeApartmentImage,
} from "@/lib/admin/apartmentImages";
import { prisma } from "@/lib/db";
import { APARTMENT_IMAGE_MAX_BYTES } from "@/lib/images/constants";
import { parseJsonBody } from "@/lib/validation/http";
import { adminApartmentImagePatchBodySchema } from "@/lib/validation/schemas";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ id: string; imageId: string }>;
};

function routeErrorResponse(err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message =
        err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: statusCode });
}

export async function PUT(request: NextRequest, context: RouteContext) {
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

    const { id: apartmentId, imageId } = await context.params;

    try {
        const formData = await request.formData();
        const file = formData.get("file");
        if (!(file instanceof File)) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }
        if (file.size > APARTMENT_IMAGE_MAX_BYTES) {
            return NextResponse.json({ error: "File too large" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const updated = await replaceApartmentImageFile({
            apartmentId,
            imageId,
            buffer,
            mimeType: file.type || "application/octet-stream",
            fileName: file.name,
        });

        return NextResponse.json({
            ok: true,
            image: serializeApartmentImage(updated),
        });
    } catch (err) {
        console.error("Failed to replace apartment image:", err);
        return routeErrorResponse(err);
    }
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

    const { id: apartmentId, imageId } = await context.params;
    const parsed = await parseJsonBody(request, adminApartmentImagePatchBodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const existing = await prisma.apartmentImage.findFirst({
            where: { id: imageId, apartmentId },
        });
        if (!existing) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }

        const updated = await prisma.apartmentImage.update({
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
            image: serializeApartmentImage(updated),
        });
    } catch (err) {
        console.error("Failed to update apartment image:", err);
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

    const { id: apartmentId, imageId } = await context.params;

    try {
        const deleted = await deleteApartmentImage({ apartmentId, imageId });
        return NextResponse.json({
            ok: true,
            image: serializeApartmentImage(deleted),
        });
    } catch (err) {
        console.error("Failed to delete apartment image:", err);
        return routeErrorResponse(err);
    }
}
