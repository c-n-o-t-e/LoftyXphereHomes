import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { listSiteImageSlotsForAdmin } from "@/lib/admin/siteImageSlots";

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
        const slots = await listSiteImageSlotsForAdmin();
        return NextResponse.json({ ok: true, slots });
    } catch (err) {
        console.error("Failed to list site image slots:", err);
        return NextResponse.json(
            { error: "Failed to list site image slots" },
            { status: 500 },
        );
    }
}
