import { getLayout, type LayoutDefinition } from "@/lib/content-studio/layouts";
import {
    STUDIO_CANVAS_HEIGHT,
    STUDIO_CANVAS_WIDTH,
    type EditorialDocument,
    type StudioAssetTransform,
    type StudioContent,
} from "@/lib/content-studio/types";

const CANVAS = STUDIO_CANVAS_WIDTH * STUDIO_CANVAS_HEIGHT;

export function targetAssetCoverage(layout: LayoutDefinition): { min: number; ideal: number; max: number } {
    if (layout.assetTreatment === "hero") {
        return { min: 0.85, ideal: 1, max: 1.28 };
    }
    if (layout.assetTreatment === "cutout") {
        return { min: 0.3, ideal: 0.42, max: 0.55 };
    }
    if (layout.assetTreatment === "object") {
        return { min: 0.1, ideal: 0.16, max: 0.24 };
    }
    return { min: 0.025, ideal: 0.04, max: 0.06 };
}

function negativeSpaceBoost(content: StudioContent, layout: LayoutDefinition): number {
    const title = content.title.replace(/\s+/g, " ").trim();
    const body = content.body.trim();
    const subtitle = content.subtitle.trim();
    let boost = 1;

    if (title.length > 0 && title.length < 18) boost += 0.22;
    else if (title.length < 28) boost += 0.12;
    else if (title.length < 42) boost += 0.05;

    if (!body && layout.zones.some((zone) => zone.include?.includes("body"))) {
        boost += 0.1;
    }
    if (!subtitle && layout.zones.some((zone) => zone.include?.includes("subtitle"))) {
        boost += 0.06;
    }

    if (layout.assetTreatment === "object" || layout.assetTreatment === "cutout") {
        boost += 0.08;
    }

    return Math.min(1.42, boost);
}

function displayedCoverage(asset: Pick<StudioAssetTransform, "width" | "height" | "scale">): number {
    return (asset.width * asset.scale * asset.height * asset.scale) / CANVAS;
}

/**
 * Scale and offset the hero object so leftover ivory feels intentional,
 * not unfinished. Does not invent extra decoration.
 */
export function artDirectAsset(
    layout: LayoutDefinition,
    content: StudioContent,
    asset: StudioAssetTransform,
): StudioAssetTransform {
    const target = targetAssetCoverage(layout);
    const boost = negativeSpaceBoost(content, layout);
    const desired = Math.min(target.max, target.ideal * boost);

    const next: StudioAssetTransform = { ...asset };
    const current = displayedCoverage(next);

    if (current > 0 && current < desired) {
        const grow = Math.sqrt(desired / current);
        next.scale = Number(Math.min(1.55, next.scale * grow).toFixed(3));
    } else if (current > target.max) {
        next.scale = Number((next.scale * Math.sqrt(target.max / current)).toFixed(3));
    }

    const w = next.width * next.scale;
    const h = next.height * next.scale;

    if (layout.imagePosition === "center") {
        next.x = 540;
        next.rotation = 0;
        next.y = Math.min(800, Math.max(740, next.y));
    } else if (layout.assetTreatment === "cutout" || layout.assetTreatment === "object") {
        const shortTitle = content.title.trim().length < 28;
        const pullX = shortTitle ? 28 : 12;
        const pullY = shortTitle ? 36 : 16;

        if (layout.imagePosition === "right" || layout.imagePosition === "accent") {
            next.x = Math.min(STUDIO_CANVAS_WIDTH - w * 0.18, next.x + pullX);
            next.y = Math.min(STUDIO_CANVAS_HEIGHT - h * 0.16, next.y + pullY * 0.35);
        }

        if (layout.id === "minimal-luxury" || layout.id === "typography-first") {
            next.x = Math.min(900, Math.max(640, next.x + 24));
            next.y = Math.min(1140, Math.max(920, next.y - 20));
            next.rotation = next.rotation || (layout.id === "minimal-luxury" ? -8 : 7);
        }
    }

    if (layout.assetTreatment === "hero") {
        next.scale = Math.max(next.scale, 1.08);
        next.x = 540;
        next.y = 640;
    }

    next.shadowBlur = Math.max(next.shadowBlur, layout.assetTreatment === "cutout" ? 56 : next.shadowBlur);
    next.shadowOffsetY = Math.max(
        next.shadowOffsetY,
        layout.assetTreatment === "cutout" ? 40 : next.shadowOffsetY,
    );
    next.shadowOpacity = Math.min(0.28, Math.max(next.shadowOpacity, 0.18));

    return next;
}

export function coverageWithinTarget(document: EditorialDocument): boolean {
    const layout = getLayout(document.layoutId);
    const { min, max } = targetAssetCoverage(layout);
    const coverage = displayedCoverage(document.asset);
    return coverage >= min * 0.85 && coverage <= max * 1.15;
}

/** Place a new visual and upscale it if the current transform still reads as a tiny icon. */
export function placeAssetOnCanvas(
    document: EditorialDocument,
    patch: Partial<StudioAssetTransform>,
): StudioAssetTransform {
    const merged: StudioAssetTransform = { ...document.asset, ...patch };
    const layout = getLayout(document.layoutId);
    const preview = { ...document, asset: merged };
    if (coverageWithinTarget(preview)) return merged;
    return artDirectAsset(layout, document.content, merged);
}

export function canvasArea(): number {
    return CANVAS;
}
