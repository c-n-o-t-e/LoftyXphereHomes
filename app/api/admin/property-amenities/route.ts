import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { listPropertyAmenitiesForAdmin } from "@/lib/admin/propertyAmenities";

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
        const amenities = await listPropertyAmenitiesForAdmin();
        return NextResponse.json({ ok: true, amenities });
    } catch (err) {
        console.error("Failed to list property amenities:", err);
        return NextResponse.json(
            { error: "Failed to list property amenities" },
            { status: 500 },
        );
    }
}
