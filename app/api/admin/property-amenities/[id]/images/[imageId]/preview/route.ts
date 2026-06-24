import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import {
    buildPropertyAmenityStorageKeyBase,
    downloadStorageObject,
} from "@/lib/images/propertyAmenityStorage";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ id: string; imageId: string }>;
};

const VARIANTS = new Set(["thumbnail", "medium", "large"]);

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

    const { id: amenityId, imageId } = await context.params;
    const variant = request.nextUrl.searchParams.get("variant") ?? "medium";
    if (!VARIANTS.has(variant)) {
        return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
    }

    const image = await prisma.propertyAmenityImage.findFirst({
        where: { id: imageId, amenityId },
    });
    if (!image) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    try {
        const storageKey = `${buildPropertyAmenityStorageKeyBase(amenityId, imageId)}/${variant}.webp`;
        const buffer = await downloadStorageObject(storageKey);

        return new NextResponse(new Blob([new Uint8Array(buffer)], { type: "image/webp" }), {
            headers: {
                "Content-Type": "image/webp",
                "Cache-Control": "private, no-store",
            },
        });
    } catch (err) {
        console.error("Failed to stream property amenity image preview:", err);
        return NextResponse.json(
            { error: "Failed to load image preview" },
            { status: 500 },
        );
    }
}
