import type { FlyerPageSize } from "@/lib/flyers/types";

/** Print resolution for export (300 DPI). */
export const FLYER_PRINT_DPI = 300;

/** 3 mm bleed on each edge. */
export const FLYER_BLEED_MM = 3;

export type FlyerDimensions = {
    label: string;
    widthMm: number;
    heightMm: number;
    widthPx: number;
    heightPx: number;
    bleedPx: number;
    exportWidthPx: number;
    exportHeightPx: number;
};

function mmToPx(mm: number, dpi = FLYER_PRINT_DPI): number {
    return Math.round((mm / 25.4) * dpi);
}

function buildDimensions(
    label: string,
    widthMm: number,
    heightMm: number,
): FlyerDimensions {
    const bleedPx = mmToPx(FLYER_BLEED_MM);
    const widthPx = mmToPx(widthMm);
    const heightPx = mmToPx(heightMm);

    return {
        label,
        widthMm,
        heightMm,
        widthPx,
        heightPx,
        bleedPx,
        exportWidthPx: widthPx + bleedPx * 2,
        exportHeightPx: heightPx + bleedPx * 2,
    };
}

export const FLYER_PAGE_DIMENSIONS: Record<FlyerPageSize, FlyerDimensions> = {
    "a5-portrait": buildDimensions("A5 Portrait", 148, 210),
    "a4-portrait": buildDimensions("A4 Portrait", 210, 297),
    "a4-landscape": buildDimensions("A4 Landscape", 297, 210),
    "us-letter": buildDimensions("US Letter", 215.9, 279.4),
};

export function getFlyerDimensions(pageSize: FlyerPageSize): FlyerDimensions {
    return FLYER_PAGE_DIMENSIONS[pageSize];
}

/** CSS pixel size of a flyer page at standard 96 DPI (used for admin preview scaling). */
export function getFlyerPreviewCssSize(pageSize: FlyerPageSize) {
    const dims = getFlyerDimensions(pageSize);
    const pxPerMm = 96 / 25.4;
    return {
        widthPx: dims.widthMm * pxPerMm,
        heightPx: dims.heightMm * pxPerMm,
    };
}

/** Root font size so `em`-based flyer typography scales with page width (preview + export). */
export function getFlyerBaseFontSize(pageSize: FlyerPageSize, forExport: boolean): string {
    const dims = getFlyerDimensions(pageSize);
    const previewCss = getFlyerPreviewCssSize(pageSize);
    const basePx = Math.round((dims.widthPx / previewCss.widthPx) * 16);

    if (forExport) {
        return `${basePx}px`;
    }

    const baseMm = (16 / previewCss.widthPx) * dims.widthMm;
    return `${baseMm.toFixed(3)}mm`;
}
