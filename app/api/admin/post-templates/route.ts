import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    createPostTemplateForAdmin,
    listPostTemplatesForAdmin,
} from "@/lib/admin/postTemplates";
import {
    createPostTemplateBodySchema,
} from "@/lib/post-generator/validation";
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
        const templates = await listPostTemplatesForAdmin();
        return NextResponse.json({ ok: true, templates });
    } catch (err) {
        console.error("Failed to list post templates:", err);
        return NextResponse.json({ error: "Failed to list templates" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin(request, ["admin"]);
        const parsed = await parseJsonBody(request, createPostTemplateBodySchema);
        if (!parsed.success) return parsed.response;

        const template = await createPostTemplateForAdmin({
            title: parsed.data.title,
            presetKey: parsed.data.presetKey,
            apartmentId: parsed.data.apartmentId,
            document: parsed.data.document,
            createdByEmail: admin.email,
        });

        return NextResponse.json({ ok: true, template }, { status: 201 });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        console.error("Failed to create post template:", err);
        const status = statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to create template" },
            { status },
        );
    }
}
