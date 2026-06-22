import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    deleteAllApartmentImages,
    serializeApartmentImage,
    uploadApartmentImageFile,
} from "@/lib/admin/apartmentImages";
import { getApartmentById } from "@/lib/data/apartments";
import { prisma } from "@/lib/db";
import { APARTMENT_IMAGE_MAX_BYTES } from "@/lib/images/constants";

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

    const { id: apartmentId } = await context.params;
    if (!getApartmentById(apartmentId)) {
        return NextResponse.json({ error: "Apartment not found" }, { status: 404 });
    }

    try {
        const images = await prisma.apartmentImage.findMany({
            where: { apartmentId },
            orderBy: { displayOrder: "asc" },
        });
        return NextResponse.json({
            ok: true,
            images: images.map(serializeApartmentImage),
        });
    } catch (err) {
        console.error("Failed to list apartment images:", err);
        return NextResponse.json(
            { error: "Failed to list images" },
            { status: 500 },
        );
    }
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

    const { id: apartmentId } = await context.params;

    try {
        const formData = await request.formData();
        const files = formData.getAll("files").filter((entry) => entry instanceof File);
        const altText = formData.get("altText");

        if (files.length === 0) {
            const single = formData.get("file");
            if (single instanceof File) files.push(single);
        }

        if (files.length === 0) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const uploaded = [];
        const errors: { fileName: string; error: string }[] = [];

        for (const file of files) {
            if (file.size > APARTMENT_IMAGE_MAX_BYTES) {
                errors.push({
                    fileName: file.name,
                    error: `File exceeds ${Math.round(APARTMENT_IMAGE_MAX_BYTES / (1024 * 1024))}MB limit.`,
                });
                continue;
            }

            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const row = await uploadApartmentImageFile({
                    apartmentId,
                    buffer,
                    mimeType: file.type || "application/octet-stream",
                    fileName: file.name,
                    altText:
                        typeof altText === "string" && altText.trim()
                            ? altText
                            : undefined,
                });
                uploaded.push(serializeApartmentImage(row));
            } catch (err) {
                errors.push({
                    fileName: file.name,
                    error: err instanceof Error ? err.message : "Upload failed",
                });
            }
        }

        if (uploaded.length === 0) {
            return NextResponse.json(
                { error: "All uploads failed", errors },
                { status: 400 },
            );
        }

        return NextResponse.json({
            ok: true,
            images: uploaded,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (err) {
        console.error("Apartment image upload failed:", err);
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

    const { id: apartmentId } = await context.params;

    try {
        const deleted = await deleteAllApartmentImages(apartmentId);
        return NextResponse.json({
            ok: true,
            images: deleted.map(serializeApartmentImage),
        });
    } catch (err) {
        console.error("Failed to delete all apartment images:", err);
        return routeErrorResponse(err);
    }
}
