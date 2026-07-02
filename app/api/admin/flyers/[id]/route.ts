import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    deleteFlyerForAdmin,
    getFlyerForAdmin,
    updateFlyerForAdmin,
} from "@/lib/admin/flyers";
import type { FlyerPageSize, FlyerPayload, FlyerTemplateKey } from "@/lib/flyers/types";
import { updateFlyerBodySchema } from "@/lib/flyers/validation";
import { parseJsonBody } from "@/lib/validation/http";

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

    const { id } = await context.params;

    try {
        const flyer = await getFlyerForAdmin(id);
        return NextResponse.json({ ok: true, flyer });
    } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to load flyer" },
            { status: statusCode },
        );
    }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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
    const parsed = await parseJsonBody(request, updateFlyerBodySchema);
    if (!parsed.success) return parsed.response;

    try {
        const flyer = await updateFlyerForAdmin(id, {
            title: parsed.data.title,
            templateKey: parsed.data.templateKey as FlyerTemplateKey | undefined,
            pageSize: parsed.data.pageSize as FlyerPageSize | undefined,
            status: parsed.data.status,
            payload: parsed.data.payload as FlyerPayload | undefined,
        });
        return NextResponse.json({ ok: true, flyer });
    } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to update flyer" },
            { status: statusCode },
        );
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
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

    try {
        await deleteFlyerForAdmin(id);
        return NextResponse.json({ ok: true });
    } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to delete flyer" },
            { status: statusCode },
        );
    }
}
