import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    deleteEditorialPostForAdmin,
    getEditorialPostForAdmin,
    updateEditorialPostForAdmin,
} from "@/lib/admin/editorialPosts";
import { updateEditorialPostBodySchema } from "@/lib/content-studio/validation";
import { parseJsonBody } from "@/lib/validation/http";
import type { EditorialPostStatus } from "@/lib/content-studio/types";

type RouteContext = { params: Promise<{ id: string }> };

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

async function withAdmin(request: NextRequest) {
    try {
        return await requireAdmin(request, ["admin"]);
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) throw { response: httpResponse };
        const status = statusCode ?? 401;
        throw {
            response: NextResponse.json(
                { error: status === 403 ? "Forbidden" : "Unauthorized" },
                { status },
            ),
        };
    }
}

export async function GET(request: NextRequest, context: RouteContext) {
    try {
        await withAdmin(request);
        const { id } = await context.params;
        const post = await getEditorialPostForAdmin(id);
        return NextResponse.json({ ok: true, post });
    } catch (err) {
        const response = (err as { response?: Response }).response;
        if (response) return response;
        const status = (err as RouteError).statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to load" },
            { status },
        );
    }
}

export async function PUT(request: NextRequest, context: RouteContext) {
    try {
        await withAdmin(request);
        const { id } = await context.params;
        const parsed = await parseJsonBody(request, updateEditorialPostBodySchema);
        if (!parsed.success) return parsed.response;

        const post = await updateEditorialPostForAdmin(id, {
            title: parsed.data.title,
            category: parsed.data.category,
            layoutId: parsed.data.layoutId,
            status: parsed.data.status as EditorialPostStatus | undefined,
            document: parsed.data.document,
        });

        return NextResponse.json({ ok: true, post });
    } catch (err) {
        const response = (err as { response?: Response }).response;
        if (response) return response;
        const status = (err as RouteError).statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to update" },
            { status },
        );
    }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
    try {
        await withAdmin(request);
        const { id } = await context.params;
        await deleteEditorialPostForAdmin(id);
        return NextResponse.json({ ok: true });
    } catch (err) {
        const response = (err as { response?: Response }).response;
        if (response) return response;
        const status = (err as RouteError).statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to delete" },
            { status },
        );
    }
}
