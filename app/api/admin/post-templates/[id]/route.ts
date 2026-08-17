import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    deletePostTemplateForAdmin,
    getPostTemplateForAdmin,
    updatePostTemplateForAdmin,
} from "@/lib/admin/postTemplates";
import { updatePostTemplateBodySchema } from "@/lib/post-generator/validation";
import { parseJsonBody } from "@/lib/validation/http";
import type { PostTemplateStatus } from "@/lib/post-generator/types";

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
        const template = await getPostTemplateForAdmin(id);
        return NextResponse.json({ ok: true, template });
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
        const parsed = await parseJsonBody(request, updatePostTemplateBodySchema);
        if (!parsed.success) return parsed.response;

        const template = await updatePostTemplateForAdmin(id, {
            title: parsed.data.title,
            presetKey: parsed.data.presetKey,
            status: parsed.data.status as PostTemplateStatus | undefined,
            document: parsed.data.document,
        });

        return NextResponse.json({ ok: true, template });
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
        await deletePostTemplateForAdmin(id);
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
