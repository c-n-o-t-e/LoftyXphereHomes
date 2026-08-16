import type { PostDocument } from "@/lib/post-generator/types";
import type {
    GeneratedThemeTokens,
    SmartThemePatch,
} from "@/lib/post-generator/smart-theme/types";
import { luminanceHex, rgba } from "@/lib/post-generator/smart-theme/colorUtils";

/** Map generated tokens onto PostDocument fields (manual editors can override later). */
export function themeTokensToPatch(
    tokens: GeneratedThemeTokens,
    current: PostDocument,
): SmartThemePatch {
    return {
        theme: {
            ...current.theme,
            primary: tokens.text,
            accent: tokens.gold,
            gold: tokens.gold,
            background: tokens.background,
            text: tokens.text,
            divider: tokens.divider,
            button: tokens.cta,
            buttonText: tokens.ctaText,
            icon: tokens.icon,
        },
        overlay: {
            ...current.overlay,
            opacity: tokens.glassOpacity,
            blur: tokens.glassBlur,
            gradientStrength: tokens.gradientStrength,
            backgroundColor: tokens.glassFill,
            borderColor: tokens.glassBorder,
            shadow: tokens.shadow,
            glassEffect: true,
            cardOffsetY: tokens.cardOffsetY,
            photoFadePercent: tokens.photoFadePercent,
        },
        layout: {
            ...current.layout,
            borderColor: tokens.border,
        },
        headline: {
            ...current.headline,
            color: tokens.text,
            accentColor: tokens.gold,
        },
        description: {
            ...current.description,
            color: tokens.text,
        },
        button: {
            ...current.button,
            backgroundColor: tokens.cta,
            textColor: tokens.ctaText,
        },
        contactStyle: {
            ...current.contactStyle,
            iconColor: tokens.icon,
            textColor: tokens.text,
        },
        logo: {
            ...current.logo,
            // Dark UI → light/champagne mark; light UI → dark or gold
            variant: (() => {
                const darkPanel =
                    tokens.id === "dark-boutique" ||
                    (tokens.id === "imaginative" &&
                        luminanceHex(tokens.background) < 0.35);
                if (darkPanel) return "light";
                if (current.logo.variant === "custom") return "custom";
                return "dark";
            })(),
        },
    };
}

export function themePreviewSwatches(tokens: GeneratedThemeTokens): string[] {
    return [tokens.background, tokens.gold, tokens.text, tokens.cta, rgba(tokens.gold, 0.25)];
}
