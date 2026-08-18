import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    createEditorialAssetForAdmin,
    listEditorialAssetsForAdmin,
} from "@/lib/admin/editorialAssets";
import { createEditorialAssetBodySchema } from "@/lib/content-studio/validation";
import type { AssetCategory } from "@/lib/content-studio/types";
import { parseJsonBody } from "@/lib/validation/http";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request, ["admin"]);
        const category = request.nextUrl.searchParams.get("category") as
            | AssetCategory
            | null;
        const approvedRaw = request.nextUrl.searchParams.get("approved");
        const assets = await listEditorialAssetsForAdmin({
            category: category ?? undefined,
            approved:
                approvedRaw === "true" ? true : approvedRaw === "false" ? false : undefined,
        });
        return NextResponse.json({ ok: true, assets });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        return NextResponse.json(
            { error: "Failed to list assets" },
            { status: statusCode ?? 500 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const admin = await requireAdmin(request, ["admin"]);
        const parsed = await parseJsonBody(request, createEditorialAssetBodySchema);
        if (!parsed.success) return parsed.response;

        const asset = await createEditorialAssetForAdmin({
            name: parsed.data.name,
            category: parsed.data.category,
            prompt: parsed.data.prompt,
            imageUrl: parsed.data.imageUrl,
            style: parsed.data.style,
            approved: parsed.data.approved,
            favorite: parsed.data.favorite,
            createdByEmail: admin.email,
        });

        return NextResponse.json({ ok: true, asset }, { status: 201 });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to save asset" },
            { status: statusCode ?? 500 },
        );
    }
}
