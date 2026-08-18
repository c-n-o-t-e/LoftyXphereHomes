import { STUDIO_PALETTE } from "@/lib/content-studio/tokens";
import type { LogoVariant, StudioTheme, ThemeId } from "@/lib/content-studio/types";

export const STUDIO_THEMES: Record<ThemeId, StudioTheme> = {
    "luxury-editorial": {
        id: "luxury-editorial",
        background: STUDIO_PALETTE.ivory,
        surface: STUDIO_PALETTE.cream,
        text: STUDIO_PALETTE.charcoal,
        textMuted: STUDIO_PALETTE.brown,
        accent: STUDIO_PALETTE.gold,
        gold: STUDIO_PALETTE.gold,
        border: STUDIO_PALETTE.gold,
        overlay: "rgba(246,239,227,0.82)",
        ctaBackground: STUDIO_PALETTE.charcoal,
        ctaText: STUDIO_PALETTE.ivory,
    },
    "warm-hospitality": {
        id: "warm-hospitality",
        background: STUDIO_PALETTE.cream,
        surface: STUDIO_PALETTE.ivory,
        text: STUDIO_PALETTE.charcoal,
        textMuted: STUDIO_PALETTE.brown,
        accent: STUDIO_PALETTE.brown,
        gold: STUDIO_PALETTE.gold,
        border: STUDIO_PALETTE.gold,
        overlay: "rgba(238,225,208,0.84)",
        ctaBackground: STUDIO_PALETTE.brown,
        ctaText: STUDIO_PALETTE.ivory,
    },
    seasonal: {
        id: "seasonal",
        background: STUDIO_PALETTE.ivory,
        surface: STUDIO_PALETTE.cream,
        text: STUDIO_PALETTE.charcoal,
        textMuted: STUDIO_PALETTE.brown,
        accent: STUDIO_PALETTE.terracotta,
        gold: STUDIO_PALETTE.gold,
        border: STUDIO_PALETTE.gold,
        overlay: "rgba(246,239,227,0.8)",
        ctaBackground: STUDIO_PALETTE.terracotta,
        ctaText: STUDIO_PALETTE.ivory,
    },
    "dark-editorial": {
        id: "dark-editorial",
        background: STUDIO_PALETTE.charcoal,
        surface: "#2E241C",
        text: STUDIO_PALETTE.ivory,
        textMuted: STUDIO_PALETTE.cream,
        accent: STUDIO_PALETTE.gold,
        gold: STUDIO_PALETTE.gold,
        border: STUDIO_PALETTE.gold,
        overlay: "rgba(36,26,20,0.62)",
        ctaBackground: STUDIO_PALETTE.gold,
        ctaText: STUDIO_PALETTE.charcoal,
    },
};

export const THEME_META: Record<
    ThemeId,
    { label: string; description: string }
> = {
    "luxury-editorial": {
        label: "Luxury Editorial",
        description: "Ivory ground, champagne accent",
    },
    "warm-hospitality": {
        label: "Warm Hospitality",
        description: "Cream, brown, and gold",
    },
    seasonal: {
        label: "Seasonal",
        description: "Ivory, gold, terracotta accent",
    },
    "dark-editorial": {
        label: "Dark Editorial",
        description: "Charcoal ground, champagne type",
    },
};

export function resolveTheme(themeId: ThemeId): StudioTheme {
    return STUDIO_THEMES[themeId];
}

export function isDarkTheme(theme: StudioTheme): boolean {
    return theme.id === "dark-editorial";
}

export function autoLogoVariant(theme: StudioTheme): LogoVariant {
    return isDarkTheme(theme) ? "light" : "gold";
}

export function logoSrc(variant: LogoVariant): string {
    if (variant === "light") return "/lofty-logo-white.png";
    return "/lofty-logo-black.png";
}
