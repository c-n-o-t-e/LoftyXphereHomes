import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import {
    isLiveImageProviderConfigured,
    resolveImageProvider,
} from "@/lib/content-studio/image-providers";
import { buildAssetPrompt } from "@/lib/content-studio/image-providers/prompt";
import { visualConceptsFor } from "@/lib/content-studio/visual-concept";
import { generateVisualBodySchema } from "@/lib/content-studio/validation";
import { parseJsonBody } from "@/lib/validation/http";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

export const maxDuration = 120;

export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request, ["admin"]);
        return NextResponse.json({
            ok: true,
            live: isLiveImageProviderConfigured(),
            provider: resolveImageProvider().id,
        });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: statusCode ?? 401 },
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await requireAdmin(request, ["admin"]);
        const parsed = await parseJsonBody(request, generateVisualBodySchema);
        if (!parsed.success) return parsed.response;

        const visuals = visualConceptsFor({
            title: parsed.data.title,
            category: parsed.data.category,
            keywords: parsed.data.keywords,
        });
        const concepts = parsed.data.concept
            ? [parsed.data.concept, visuals.concepts[1], visuals.concepts[2]]
            : [...visuals.concepts];

        const layoutId = parsed.data.layoutId;
        const treatment =
            layoutId === "full-bleed"
                ? "hero"
                : layoutId === "typography-first" || layoutId === "minimal-luxury"
                  ? "object"
                  : layoutId === "information-grid"
                    ? "accent"
                    : "cutout";

        const provider = resolveImageProvider();
        const alternatives = await Promise.all(
            concepts.slice(0, 3).map(async (concept) => {
                const prompt = buildAssetPrompt(concept, treatment);
                const result = await provider.generate({
                    prompt,
                    size: treatment === "hero" ? "1024x1536" : "1024x1536",
                    transparent: treatment !== "hero",
                });
                return {
                    concept,
                    imageUrl: result.imageUrl,
                    prompt: "",
                    provider: result.provider,
                    model: result.model,
                };
            }),
        );

        return NextResponse.json({
            ok: true,
            live: isLiveImageProviderConfigured(),
            provider: provider.id,
            assetCategory: visuals.category,
            alternatives,
        });
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        console.error("Failed to generate editorial visual:", err);
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Failed to generate visual" },
            { status: statusCode ?? 500 },
        );
    }
}
