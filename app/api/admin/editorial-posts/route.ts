import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    createEditorialPostForAdmin,
    listEditorialPostsForAdmin,
} from "@/lib/admin/editorialPosts";
import { createEditorialPostBodySchema } from "@/lib/content-studio/validation";
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
        const posts = await listEditorialPostsForAdmin();
        return NextResponse.json({ ok: true, posts });
    } catch (err) {
        console.error("Failed to list editorial posts:", err);
        return NextResponse.json({ error: "Failed to list posts" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin(request, ["admin"]);
        const parsed = await parseJsonBody(request, createEditorialPostBodySchema);
        if (!parsed.success) return parsed.response;

        const post = await createEditorialPostForAdmin({
            title: parsed.data.title,
            category: parsed.data.category,
            layoutId: parsed.data.layoutId,
            document: parsed.data.document,
            createdByEmail: admin.email,
        });

        return NextResponse.json({ ok: true, post }, { status: 201 });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        console.error("Failed to create editorial post:", err);
        const status = statusCode ?? 500;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to create post" },
            { status },
        );
    }
}
