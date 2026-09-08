/**
 * Design tokens for the approved Instagram post reference.
 * Prefer these over magic numbers in preview + export.
 */

export const POST_TOKENS = {
    colors: {
        ivory: "#F8F4EC",
        gold: "#C8A66A",
        /** Inset luxury frame — champagne gold, same as accent. */
        frameBorder: "#C8A66A",
        text: "#2C2C2C",
        textMuted: "#3A3A3A",
        white: "#FFFFFF",
        glassBorder: "rgba(255,255,255,0.35)",
        divider: "rgba(200,166,106,0.18)",
        shadow: "rgba(44,44,44,0.08)",
    },
    frame: {
        /** Inset of the single luxury border from canvas edges (px). */
        borderInset: 28,
        borderThickness: 1.5,
        borderRadius: 30,
    },
    glass: {
        opacity: 0.28,
        blur: 22,
        borderRadius: 30,
        borderThickness: 1,
        shadow: 10,
        /** Raise card over the photo fade (negative = higher). */
        cardOffsetY: -40,
        cardInsetX: 36,
    },
    photo: {
        /** Hero band as % of full canvas height. */
        heightPercent: 62,
        /** Soft fade as % of photo height (lower edge into ivory). */
        fadePercent: 13,
        /** How far the glass card overlaps the photo (% of canvas). */
        overlapPercent: 14,
    },
    spacing: {
        contentPaddingX: 40,
        contentPaddingTop: 34,
        contentPaddingBottom: 28,
        footerGap: 28,
        amenityColumnGap: 6,
    },
    type: {
        headlineSize: 58,
        headlineLineHeight: 1.12,
        bodySize: 15,
        ctaSize: 13,
        ctaPaddingX: 24,
        ctaPaddingY: 16,
        ctaRadius: 12,
    },
} as const;

export function goldDivider(alpha = 0.18): string {
    return `rgba(200,166,106,${alpha})`;
}

/** Option 2 — lookbook split. Does not alter the approved stacked editorial. */
export const ATELIER_TOKENS = {
    photoWidthPercent: 58,
    hairline: 1,
    panelPadX: 44,
    panelPadTop: 52,
    panelPadBottom: 40,
} as const;
