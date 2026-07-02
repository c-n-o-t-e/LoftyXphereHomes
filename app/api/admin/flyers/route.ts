import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { createFlyerForAdmin, listFlyersForAdmin } from "@/lib/admin/flyers";
import type { FlyerPageSize, FlyerTemplateKey } from "@/lib/flyers/types";
import { createFlyerBodySchema } from "@/lib/flyers/validation";
import { parseJsonBody } from "@/lib/validation/http";

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
        const flyers = await listFlyersForAdmin();
        return NextResponse.json({ ok: true, flyers });
    } catch (err) {
        console.error("Failed to list flyers:", err);
        return NextResponse.json({ error: "Failed to list flyers" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin(request, ["admin"]);
        const parsed = await parseJsonBody(request, createFlyerBodySchema);
        if (!parsed.success) return parsed.response;

        const flyer = await createFlyerForAdmin({
            title: parsed.data.title,
            templateKey: parsed.data.templateKey as FlyerTemplateKey,
            pageSize: parsed.data.pageSize as FlyerPageSize | undefined,
            apartmentId: parsed.data.apartmentId,
            createdByEmail: admin.email,
        });

        return NextResponse.json({ ok: true, flyer }, { status: 201 });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        console.error("Failed to create flyer:", err);
        const status = statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to create flyer" },
            { status },
        );
    }
}
