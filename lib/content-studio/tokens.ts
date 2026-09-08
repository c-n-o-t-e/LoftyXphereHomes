/**
 * LoftyXphereHomes editorial brand tokens.
 * Shared by every Content Studio layout — different compositions, same language.
 */

export const STUDIO_PALETTE = {
    ivory: "#F6EFE3",
    cream: "#EEE1D0",
    sand: "#E7D5B9",
    charcoal: "#241A14",
    espresso: "#2B211A",
    umber: "#4C3A2E",
    brown: "#5A4331",
    gold: "#C8A66A",
    terracotta: "#A44D2D",
    white: "#FFFFFF",
} as const;

export const STUDIO_BACKGROUNDS = [
    STUDIO_PALETTE.ivory,
    STUDIO_PALETTE.cream,
    STUDIO_PALETTE.sand,
    STUDIO_PALETTE.espresso,
    STUDIO_PALETTE.umber,
] as const;

export const STUDIO_CTAS = [
    "Book your stay",
    "Discover more",
    "Explore Abuja",
    "Read more",
    "Plan your stay",
    "Save this",
    "Share this",
] as const;

export const STUDIO_TOKENS = {
    colors: STUDIO_PALETTE,
    frame: {
        inset: 42,
        thickness: 1,
        radius: 0,
    },
    type: {
        display: '"Playfair Display", "Times New Roman", serif',
        sans: '"Inter", "Helvetica Neue", sans-serif',
    },
    spacing: {
        page: 64,
        tight: 22,
        footer: 36,
    },
    asset: {
        style: "lxh-editorial" as const,
        shadow: "0 28px 60px rgba(36, 26, 20, 0.16)",
    },
    cta: {
        language: STUDIO_CTAS,
    },
} as const;

export function goldAlpha(alpha = 0.28): string {
    return `rgba(200,166,106,${alpha})`;
}

export function charcoalAlpha(alpha = 0.08): string {
    return `rgba(36,26,20,${alpha})`;
}
