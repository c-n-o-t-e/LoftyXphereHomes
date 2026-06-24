import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { serializePropertyAmenityImage } from "@/lib/admin/propertyAmenityImages";
import { getPropertyAmenityById } from "@/lib/admin/propertyAmenities";
import { prisma } from "@/lib/db";
import { ensureApartmentImagesBucket } from "@/lib/images/bucket";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ id: string }>;
};

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

    const { id: amenityId } = await context.params;
    if (!(await getPropertyAmenityById(amenityId))) {
        return NextResponse.json({ error: "Property amenity not found" }, { status: 404 });
    }

    try {
        await ensureApartmentImagesBucket();
        const images = await prisma.propertyAmenityImage.findMany({
            where: { amenityId },
            orderBy: { displayOrder: "asc" },
        });
        return NextResponse.json({
            ok: true,
            images: images.map(serializePropertyAmenityImage),
        });
    } catch (err) {
        console.error("Failed to list property amenity images:", err);
        return NextResponse.json(
            { error: "Failed to list images" },
            { status: 500 },
        );
    }
}
