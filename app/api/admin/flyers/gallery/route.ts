import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { listFlyerGalleryImages } from "@/lib/admin/flyerGallery";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

export async function GET(request: NextRequest) {
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

    try {
        const images = await listFlyerGalleryImages();
        return NextResponse.json({ ok: true, images });
    } catch (err) {
        console.error("Failed to list flyer gallery images:", err);
        return NextResponse.json(
            { error: "Failed to load gallery images" },
            { status: 500 },
        );
    }
}
