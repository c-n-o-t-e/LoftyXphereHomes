import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { prisma } from "@/lib/db";
import {
    buildStorageKeyBase,
    downloadStorageObject,
} from "@/lib/images/storage";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ id: string; imageId: string }>;
};

const VARIANTS = new Set(["thumbnail", "medium", "large", "original"]);

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

    const { id: apartmentId, imageId } = await context.params;
    const variant = request.nextUrl.searchParams.get("variant") ?? "medium";
    if (!VARIANTS.has(variant)) {
        return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
    }

    const image = await prisma.apartmentImage.findFirst({
        where: { id: imageId, apartmentId },
    });
    if (!image) {
        return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    try {
        const storageKey = `${buildStorageKeyBase(apartmentId, imageId)}/${variant}.webp`;
        const buffer = await downloadStorageObject(storageKey);

        const body = buffer.buffer.slice(
            buffer.byteOffset,
            buffer.byteOffset + buffer.byteLength,
        ) as ArrayBuffer;

        return new NextResponse(body, {
            headers: {
                "Content-Type": "image/webp",
                "Cache-Control": "private, no-store",
            },
        });
    } catch (err) {
        console.error("Failed to stream apartment image preview:", err);
        return NextResponse.json(
            { error: "Failed to load image preview" },
            { status: 500 },
        );
    }
}
