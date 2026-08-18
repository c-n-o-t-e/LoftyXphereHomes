import { getLayout, zoneOf } from "@/lib/content-studio/layouts";
import {
    assetOverlapsZone,
    assetWithinCanvas,
    estimateTitleOverflow,
} from "@/lib/content-studio/layout-engine";
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

export function checkEditorialQuality(document: EditorialDocument): QualityReport {
    const issues: QualityIssue[] = [];
    const layout = getLayout(document.layoutId);
    const titleZone = zoneOf(layout, "title")?.rect;
    const ctaZone = zoneOf(layout, "cta")?.rect;
    const logoZone = zoneOf(layout, "logo")?.rect;

    if (!document.content.title.trim()) {
        issues.push({
            id: "title-empty",
            severity: "error",
            message: "Add a headline before export.",
        });
    }

    if (
        titleZone &&
        estimateTitleOverflow(
            document.content.title,
            document.typography.titleSize,
            titleZone,
            document.typography.titleLineHeight,
        )
    ) {
        issues.push({
            id: "title-overflow",
            severity: "error",
            message: "Headline is overflowing its safe zone. Reduce size or shorten the line.",
        });
    }

    if (document.asset.url && !assetWithinCanvas(document)) {
        issues.push({
            id: "asset-overflow",
            severity: "error",
            message: "The visual asset extends too far past the canvas.",
        });
    }

    if (document.asset.url && titleZone && assetOverlapsZone(document, titleZone, 8)) {
        if (!layout.heroBleed) {
            issues.push({
                id: "collision",
                severity: "warning",
                message: "The asset is colliding with the headline. Nudge it or scale down.",
            });
        }
    }

    const contrast = contrastRatio(document.theme.text, document.theme.background);
    if (contrast < 4.2) {
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

    if (
        ["editorial-split", "typography-first", "minimal-luxury"].includes(document.layoutId) &&
        document.content.title.trim().length < 8 &&
        !document.asset.url
    ) {
        issues.push({
            id: "empty-space",
            severity: "warning",
            message: "The composition has too much empty space. Add a visual or a longer line.",
        });
    }

    if (ctaZone && document.content.cta.trim() && document.typography.ctaSize < 11) {
        issues.push({
            id: "cta-visibility",
            severity: "warning",
            message: "The CTA is too small to read on a phone.",
        });
    }

    if (logoZone && document.logo.opacity < 0.35) {
        issues.push({
            id: "logo-visibility",
            severity: "warning",
            message: "The logo is too faint to remain recognizable.",
        });
    }

    if (document.logo.size > 140) {
        issues.push({
            id: "logo-dominant",
            severity: "warning",
            message: "The logo is dominating the composition. Keep it subtle.",
        });
    }

    const titleAlign = zoneOf(layout, "title")?.align;
    if (titleAlign === "center" && document.typography.titleSize < 40) {
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
