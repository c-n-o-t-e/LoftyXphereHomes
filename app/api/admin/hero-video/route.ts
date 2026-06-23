import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    deleteActiveHeroVideo,
    getActiveHeroVideo,
    serializeHeroVideo,
} from "@/lib/admin/heroVideo";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

function routeErrorResponse(err: unknown) {
    const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
    const message =
        err instanceof Error ? err.message : "Unexpected server error";
    return NextResponse.json({ error: message }, { status: statusCode });
}

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

    const heroVideo = await getActiveHeroVideo();
    return NextResponse.json({
        heroVideo: heroVideo ? serializeHeroVideo(heroVideo) : null,
    });
}

export async function DELETE(request: NextRequest) {
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
        const deleted = await deleteActiveHeroVideo();
        return NextResponse.json({ heroVideo: serializeHeroVideo(deleted) });
    } catch (err) {
        console.error("Failed to delete hero video:", err);
        return routeErrorResponse(err);
    }
}
