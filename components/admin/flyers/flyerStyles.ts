import { getAmenityLabelByKey } from "@/lib/amenities/suiteAmenities";
import { getFlyerBaseFontSize, getFlyerDimensions } from "@/lib/flyers/dimensions";
import { getFlyerTemplate } from "@/lib/flyers/templates";
import type {
    FlyerLogoPosition,
    FlyerPageSize,
    FlyerPayload,
    FlyerTemplateKey,
} from "@/lib/flyers/types";
import type { CSSProperties } from "react";

export function getAmenityLabel(key: string): string {
    return getAmenityLabelByKey(key);
}

export function logoPositionStyles(position: FlyerLogoPosition): CSSProperties {
    switch (position) {
        case "top-left":
            return { top: "5%", left: "5%" };
        case "top-right":
            return { top: "5%", right: "5%" };
        case "bottom-left":
            return { bottom: "5%", left: "5%" };
        case "bottom-right":
            return { bottom: "5%", right: "5%" };
    }
}

export function getHeroOverlayStyle(
    overlay: ReturnType<typeof getFlyerTemplate>["heroOverlay"],
): CSSProperties {
    switch (overlay) {
        case "gradient-dark":
            return {
                background:
                    "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.82) 100%)",
            };
        case "gradient-navy":
            return {
                background:
                    "linear-gradient(180deg, rgba(10,25,47,0.2) 0%, rgba(10,25,47,0.65) 60%, rgba(10,25,47,0.9) 100%)",
            };
        case "solid-scrim":
            return { background: "rgba(0,0,0,0.45)" };
        case "minimal":
            return {
                background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.7) 100%)",
            };
        case "none":
            return { background: "transparent" };
    }
}

function resolveExportFontFamily(fontStack: string): string {
    return fontStack.replace(/var\(--font-[\w-]+\),\s*/g, "");
}

export function getFlyerFontsForRender(
    templateKey: FlyerTemplateKey,
    forExport?: boolean,
): { displayFont: string; bodyFont: string } {
    const template = getFlyerTemplate(templateKey);
    if (!forExport) {
        return { displayFont: template.displayFont, bodyFont: template.bodyFont };
    }
    return {
        displayFont: resolveExportFontFamily(template.displayFont),
        bodyFont: resolveExportFontFamily(template.bodyFont),
    };
}

export function getFlyerPageStyle(args: {
    pageSize: FlyerPageSize;
    payload: FlyerPayload;
    templateKey: FlyerTemplateKey;
    forExport?: boolean;
}): CSSProperties {
    const dims = getFlyerDimensions(args.pageSize);
    const template = getFlyerTemplate(args.templateKey);

    return {
        width: args.forExport ? `${dims.widthPx}px` : `${dims.widthMm}mm`,
        height: args.forExport ? `${dims.heightPx}px` : `${dims.heightMm}mm`,
        backgroundColor: args.payload.theme.backgroundColor,
        color: args.payload.theme.textColor,
        fontFamily: args.forExport
            ? resolveExportFontFamily(template.bodyFont)
            : template.bodyFont,
        fontSize: getFlyerBaseFontSize(args.pageSize, Boolean(args.forExport)),
        position: "relative",
        overflow: "hidden",
        boxSizing: "border-box",
        flexShrink: args.forExport ? 0 : undefined,
    };
}

export const FLYER_FONT_IMPORT =
    "@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Montserrat:wght@400;500;600;700&family=Playfair+Display:wght@500;600;700&family=Poppins:wght@300;400;500;600&display=swap');";
