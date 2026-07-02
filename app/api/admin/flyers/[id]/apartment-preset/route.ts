import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin/auth";
import { applyApartmentPresetToFlyer } from "@/lib/admin/flyers";
import { parseJsonBody } from "@/lib/validation/http";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

type RouteContext = {
    params: Promise<{ id: string }>;
};

const bodySchema = z.object({ apartmentId: z.string().trim().min(1) }).strict();

export async function POST(request: NextRequest, context: RouteContext) {
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

    const { id } = await context.params;
    const parsed = await parseJsonBody(request, bodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const flyer = await applyApartmentPresetToFlyer(id, parsed.data.apartmentId);
        return NextResponse.json({ ok: true, flyer });
    } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to apply apartment preset" },
            { status: statusCode },
        );
    }
}
