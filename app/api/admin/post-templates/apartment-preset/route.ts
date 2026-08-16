import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { buildPostDocumentFromApartment } from "@/lib/admin/postTemplates";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request, ["admin"]);
        const apartmentId = request.nextUrl.searchParams.get("apartmentId");
        if (!apartmentId) {
            return NextResponse.json({ error: "apartmentId required" }, { status: 400 });
        }
        const patch = await buildPostDocumentFromApartment(apartmentId);
        return NextResponse.json({ ok: true, patch });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        const status = statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to load apartment" },
            { status },
        );
    }
}
