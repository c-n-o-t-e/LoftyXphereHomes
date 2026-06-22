import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getApartmentImageCounts } from "@/lib/data/getApartmentImages";
import { apartments } from "@/lib/data/apartments";

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
        const imageCounts = await getApartmentImageCounts();
        return NextResponse.json({
            ok: true,
            apartments: apartments.map((apartment) => ({
                id: apartment.id,
                name: apartment.name,
                location: apartment.location,
                imageCount: imageCounts[apartment.id] ?? 0,
            })),
        });
    } catch (err) {
        console.error("Failed to list apartments for admin:", err);
        return NextResponse.json(
            { error: "Failed to list apartments" },
            { status: 500 },
        );
    }
}
