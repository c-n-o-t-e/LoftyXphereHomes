import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    deleteEditorialAssetForAdmin,
    updateEditorialAssetForAdmin,
} from "@/lib/admin/editorialAssets";
import { updateEditorialAssetBodySchema } from "@/lib/content-studio/validation";
import { parseJsonBody } from "@/lib/validation/http";

type RouteContext = { params: Promise<{ id: string }> };

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        await requireAdmin(request, ["admin"]);
        const { id } = await context.params;
        const parsed = await parseJsonBody(request, updateEditorialAssetBodySchema);
        if (!parsed.success) return parsed.response;
        const asset = await updateEditorialAssetForAdmin(id, parsed.data);
        return NextResponse.json({ ok: true, asset });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to update asset" },
            { status: statusCode ?? 500 },
        );
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        await requireAdmin(request, ["admin"]);
        const { id } = await context.params;
        await deleteEditorialAssetForAdmin(id);
        return NextResponse.json({ ok: true });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to delete asset" },
            { status: statusCode ?? 500 },
        );
    }
}
