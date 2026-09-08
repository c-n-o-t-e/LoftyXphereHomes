import { expectedAssetCoverage, getLayout, zoneOf } from "@/lib/content-studio/layouts";
import { assetCoverage, estimateLineCount } from "@/lib/content-studio/fit-typography";
import {
    assetOverlapsZone,
    assetWithinCanvas,
} from "@/lib/content-studio/layout-engine";
import { isPlaceholderAsset } from "@/lib/content-studio/placeholders";
import type {
    EditorialDocument,
    QualityIssue,
    QualityReport,
} from "@/lib/content-studio/types";

function relativeLuminance(hex: string): number {
    const raw = hex.replace("#", "");
    if (raw.length !== 6) return 0.5;
    const r = Number.parseInt(raw.slice(0, 2), 16) / 255;
    const g = Number.parseInt(raw.slice(2, 4), 16) / 255;
    const b = Number.parseInt(raw.slice(4, 6), 16) / 255;
    const lin = [r, g, b].map((c) =>
        c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function contrastRatio(a: string, b: string): number {
    const l1 = relativeLuminance(a);
    const l2 = relativeLuminance(b);
    const light = Math.max(l1, l2);
    const dark = Math.min(l1, l2);
    return (light + 0.05) / (dark + 0.05);
}

export const QUALITY_CHECK_IDS = [
    "title-empty",
    "title-overflow",
    "empty-space",
    "asset-missing",
    "asset-too-small",
    "asset-overflow",
    "asset-resolution",
    "collision",
    "contrast",
    "cta-visibility",
    "cta-edge",
    "logo-visibility",
    "logo-dominant",
    "footer-visibility",
    "safe-margins",
    "alignment",
    "points-thin",
    "icon-monotony",
] as const;

export function checkEditorialQuality(document: EditorialDocument): QualityReport {
    const issues: QualityIssue[] = [];
    const layout = getLayout(document.layoutId);
    const titleZone =
        zoneOf(layout, "text-stack")?.rect ?? zoneOf(layout, "title")?.rect;
    const ctaZone = zoneOf(layout, "cta")?.rect;
    const logoZone = zoneOf(layout, "logo")?.rect;
    const footerZone = zoneOf(layout, "footer")?.rect;

    if (!document.content.title.trim()) {
        issues.push({
            id: "title-empty",
            severity: "error",
            message: "Add a headline before export.",
        });
    }

    if (titleZone && document.content.title.trim()) {
        const lines = estimateLineCount(
            document.content.title,
            document.typography.titleSize,
            titleZone.w,
        );
        const needed =
            lines * document.typography.titleSize * document.typography.titleLineHeight;
        if (needed > titleZone.h + 24) {
            issues.push({
                id: "title-overflow",
                severity: "error",
                message: "Headline is overflowing its safe zone. Shorten the line or ease the size slightly.",
            });
        }
        if (
            document.content.title.trim().length < 18 &&
            document.typography.titleSize < 44 &&
            layout.headlineSize !== "compact"
        ) {
            issues.push({
                id: "empty-space",
                severity: "warning",
                message: "Headline has excessive empty space. Increase display size so the type can occupy the composition.",
            });
        }
    }

    const visualLayouts = ["editorial-split", "full-bleed", "cut-out", "magazine-editorial"];
    if (visualLayouts.includes(document.layoutId) && !document.asset.url) {
        issues.push({
            id: "asset-missing",
            severity: "warning",
            message: "This layout is built around a visual. Generate or upload an asset.",
        });
    }

    if (document.asset.url) {
        if (!assetWithinCanvas(document) && !layout.heroBleed) {
            issues.push({
                id: "asset-overflow",
                severity: "error",
                message: "The visual asset extends too far past the canvas.",
            });
        }

        const coverage = assetCoverage(document);
        if (coverage < expectedAssetCoverage(layout) * 0.55) {
            issues.push({
                id: "asset-too-small",
                severity: "warning",
                message: "Visual asset too small. Scale it so it can carry the composition.",
            });
        }

        if (isPlaceholderAsset(document.asset.url)) {
            issues.push({
                id: "asset-resolution",
                severity: "warning",
                message: "The canvas is using a placeholder stand-in. Generate photography before publishing.",
            });
        }
    }

    if (document.asset.url && titleZone && assetOverlapsZone(document, titleZone, 8)) {
        if (!layout.heroBleed && layout.assetTreatment !== "cutout") {
            issues.push({
                id: "collision",
                severity: "warning",
                message: "The asset is colliding with the headline. Nudge it or scale down.",
            });
        }
    }

    const contrast = contrastRatio(document.theme.text, document.theme.background);
    if (contrast < 4.2 && !layout.heroBleed) {
        issues.push({
            id: "contrast",
            severity: "error",
            message: "Text contrast is too low against the background.",
        });
    }

    if (document.layoutId === "information-grid" || document.layoutId === "magazine-editorial") {
        const visible = document.content.points.filter(
            (point) => point.heading.trim() || point.body.trim(),
        );
        if (visible.length < 3) {
            issues.push({
                id: "points-thin",
                severity: "warning",
                message: "This layout expects at least three information points.",
            });
        }
        const icons = new Set(visible.map((point) => point.icon));
        if (icons.size === 1 && visible.length > 3) {
            issues.push({
                id: "icon-monotony",
                severity: "warning",
                message: "Vary the icons so the grid does not look copy-pasted.",
            });
        }
    }

    if (layout.showCta && document.content.cta.trim()) {
        if (document.typography.ctaSize < 11) {
            issues.push({
                id: "cta-visibility",
                severity: "warning",
                message: "The CTA is too small to read on a phone.",
            });
        }
        const edgeZone = ctaZone ?? zoneOf(layout, "text-stack")?.rect;
        if (edgeZone && edgeZone.x < 28) {
            issues.push({
                id: "cta-edge",
                severity: "warning",
                message: "CTA too close to edge. Keep a comfortable margin.",
            });
        }
    }

    if (logoZone && document.logo.opacity < 0.35) {
        issues.push({
            id: "logo-visibility",
            severity: "warning",
            message: "The logo is too faint to remain recognizable.",
        });
    }

    if (document.logo.size > 120) {
        issues.push({
            id: "logo-dominant",
            severity: "warning",
            message: "The logo is dominating the composition. Keep it subtle.",
        });
    }

    if (
        document.footer.variant !== "logo-only" &&
        !document.footer.website.trim() &&
        !document.footer.instagram.trim()
    ) {
        issues.push({
            id: "footer-visibility",
            severity: "warning",
            message: "Footer has no copy. Add a website or switch to logo-only.",
        });
    }

    const marginZones = [logoZone, footerZone].filter(Boolean);
    for (const zone of marginZones) {
        if (!zone) continue;
        if (zone.x < 36 || zone.y + zone.h > 1320) {
            issues.push({
                id: "safe-margins",
                severity: "warning",
                message: "Logo or footer sits outside the safe margin.",
            });
            break;
        }
    }

    const titleAlign = zoneOf(layout, "text-stack")?.align ?? zoneOf(layout, "title")?.align;
    if (titleAlign === "center" && document.typography.titleSize < 52) {
        issues.push({
            id: "alignment",
            severity: "warning",
            message: "Centered editorial layouts need a larger display size.",
        });
    }

    return {
        ready: issues.every((issue) => issue.severity !== "error"),
        issues,
    };
}
