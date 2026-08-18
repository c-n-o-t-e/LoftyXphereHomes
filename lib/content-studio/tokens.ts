/**
 * LoftyXphereHomes editorial brand tokens.
 * Shared by every Content Studio layout — different compositions, same language.
 */

export const STUDIO_PALETTE = {
    ivory: "#F6EFE3",
    cream: "#EEE1D0",
    charcoal: "#241A14",
    brown: "#5B4636",
    gold: "#C8A66A",
    terracotta: "#9E4E2E",
    white: "#FFFFFF",
} as const;

export const STUDIO_TOKENS = {
    colors: STUDIO_PALETTE,
    frame: {
        inset: 36,
        thickness: 1.25,
        radius: 0,
    },
    type: {
        display: '"Playfair Display", "Times New Roman", serif',
        sans: '"Inter", "Helvetica Neue", sans-serif',
    },
    spacing: {
        page: 72,
        tight: 28,
        footer: 40,
    },
    asset: {
        style: "lxh-editorial",
        shadow: "0 28px 60px rgba(36, 26, 20, 0.16)",
    },
    cta: {
        language: [
            "Discover more",
            "Enquire to stay",
            "Book a stay",
            "Visit loftyxpherehomes.com",
        ],
    },
} as const;

export function goldAlpha(alpha = 0.28): string {
    return `rgba(200,166,106,${alpha})`;
}

export function charcoalAlpha(alpha = 0.08): string {
    return `rgba(36,26,20,${alpha})`;
}
