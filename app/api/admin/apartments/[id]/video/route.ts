import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    deleteApartmentVideo,
    getApartmentVideoRow,
    serializeApartmentVideo,
} from "@/lib/admin/apartmentVideo";

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

async function requireAdminAccess(request: NextRequest) {
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
    return null;
}

export async function GET(request: NextRequest, context: RouteContext) {
    const authError = await requireAdminAccess(request);
    if (authError) return authError;

    const { id: apartmentId } = await context.params;
    const row = await getApartmentVideoRow(apartmentId);
    return NextResponse.json({
        apartmentVideo: row ? serializeApartmentVideo(row) : null,
    });
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    const authError = await requireAdminAccess(request);
    if (authError) return authError;

    const { id: apartmentId } = await context.params;

    try {
        const deleted = await deleteApartmentVideo(apartmentId);
        return NextResponse.json({
            apartmentVideo: serializeApartmentVideo(deleted),
        });
    } catch (err) {
        console.error("Failed to delete apartment video:", err);
        return routeErrorResponse(err);
    }
}
