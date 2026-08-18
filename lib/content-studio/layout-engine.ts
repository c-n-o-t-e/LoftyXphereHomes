import { applyLayoutToDocument } from "@/lib/content-studio/defaults";
import { getLayout, zoneOf } from "@/lib/content-studio/layouts";
import type {
    EditorialDocument,
    LayoutId,
    StudioFormatId,
    StudioRect,
} from "@/lib/content-studio/types";
import { STUDIO_FORMATS } from "@/lib/content-studio/types";

export function canvasSize(format: StudioFormatId) {
    return STUDIO_FORMATS[format];
}

export function applyLayout(
    document: EditorialDocument,
    layoutId: LayoutId,
): EditorialDocument {
    return applyLayoutToDocument(document, layoutId, { keepAssetUrl: true });
}

export function assetOverlapsZone(
    document: EditorialDocument,
    zone: StudioRect,
    padding = 16,
): boolean {
    const halfW = (document.asset.width * document.asset.scale) / 2;
    const halfH = (document.asset.height * document.asset.scale) / 2;
    const left = document.asset.x - halfW;
    const right = document.asset.x + halfW;
    const top = document.asset.y - halfH;
    const bottom = document.asset.y + halfH;

    return !(
        right < zone.x + padding ||
        left > zone.x + zone.w - padding ||
        bottom < zone.y + padding ||
        top > zone.y + zone.h - padding
    );
}

export function assetWithinCanvas(document: EditorialDocument): boolean {
    const { width, height } = canvasSize(document.format);
    const halfW = (document.asset.width * document.asset.scale) / 2;
    const halfH = (document.asset.height * document.asset.scale) / 2;
    return (
        document.asset.x - halfW > -40 &&
        document.asset.x + halfW < width + 40 &&
        document.asset.y - halfH > -40 &&
        document.asset.y + halfH < height + 40
    );
}

export function titleSafeZone(layoutId: LayoutId): StudioRect | undefined {
    return zoneOf(getLayout(layoutId), "title")?.rect;
}

export function estimateTitleOverflow(
    title: string,
    titleSize: number,
    zone: StudioRect,
    lineHeight: number,
): boolean {
    const avgChar = titleSize * 0.52;
    const charsPerLine = Math.max(8, Math.floor(zone.w / avgChar));
    const lines = Math.ceil(Math.max(1, title.trim().length) / charsPerLine);
    return lines * titleSize * lineHeight > zone.h + 8;
}

export function serializeLayoutJson(layoutId: LayoutId) {
    const layout = getLayout(layoutId);
    return {
        layout: layout.id,
        category: layout.categories[0],
        imagePosition: layout.imagePosition,
        textPosition: layout.textPosition,
        footer: layout.footer,
        assetStyle: layout.assetStyle,
        theme: layout.theme,
    };
}
