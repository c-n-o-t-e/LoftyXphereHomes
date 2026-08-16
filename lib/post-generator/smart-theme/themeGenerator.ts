import {
    bestTextOn,
    clamp,
    ensureAaText,
    liftToSurface,
    mixHex,
    polishAccent,
    rgba,
    softIvoryFrom,
    toChampagneGold,
} from "@/lib/post-generator/smart-theme/colorUtils";
import {
    describeLayoutChoice,
    suggestAlternateCardOffsetY,
    suggestAlternatePhotoFadePercent,
    suggestCardOffsetY,
    suggestPhotoFadePercent,
} from "@/lib/post-generator/smart-theme/layoutGenerator";
import type {
    GeneratedThemeTokens,
    ImageAnalysis,
    ImaginativeExpression,
    SmartRecommendation,
    SmartThemeId,
} from "@/lib/post-generator/smart-theme/types";

function pickAccent(analysis: ImageAnalysis): string {
    const sample =
        analysis.accentColors[0] ||
        analysis.dominantColors[0] ||
        "#C8A66A";
    return toChampagneGold(sample);
}

/** Raw photo accent (hue preserved) for Imaginative. */
function pickImageNativeAccent(analysis: ImageAnalysis): string {
    const sample =
        analysis.accentColors[0] ||
        analysis.dominantColors[1] ||
        analysis.dominantColors[0] ||
        "#C8A66A";
    return polishAccent(sample);
}

function tuneGlassOpacity(analysis: ImageAnalysis, base: number): number {
    const brightnessAdj = (analysis.brightness - 0.5) * 0.12;
    const contrastAdj = analysis.contrast * 0.06;
    return clamp(base + brightnessAdj + contrastAdj, 0.18, 0.55);
}

function buildTheme(
    id: SmartThemeId,
    label: string,
    description: string,
    analysis: ImageAnalysis,
    opts: {
        background: string;
        glassFill: string;
        glassOpacity: number;
        glassBlur: number;
        gradientStrength: number;
        gold: string;
        shadow: number;
        darkUi?: boolean;
        glassBorder?: string;
        cardOffsetY?: number;
        photoFadePercent?: number;
        expression?: ImaginativeExpression;
    },
): GeneratedThemeTokens {
    const cardOffsetY = opts.cardOffsetY ?? suggestCardOffsetY(analysis);
    const photoFadePercent =
        opts.photoFadePercent ?? suggestPhotoFadePercent(analysis);
    const glassOpacity = tuneGlassOpacity(analysis, opts.glassOpacity);

    const textGround = opts.darkUi
        ? mixHex(opts.background, "#000000", 0.25)
        : mixHex(opts.background, opts.glassFill, 0.35);
    let text = opts.darkUi ? "#F5F0E8" : "#2C2C2C";
    text = ensureAaText(text, textGround, true);
    const gold = opts.gold;
    const cta = gold;
    const ctaText = bestTextOn(cta) === "#FFFFFF" ? "#FFFFFF" : "#1A1A1A";
    const ctaTextFinal =
        ensureAaText("#FFFFFF", cta, true) === "#FFFFFF" ? "#FFFFFF" : ctaText;

    return {
        id,
        label,
        description,
        expression: opts.expression,
        background: opts.background,
        glassFill: opts.glassFill,
        glassOpacity: Math.round(glassOpacity * 100) / 100,
        glassBlur: opts.glassBlur,
        gradientStrength: opts.gradientStrength,
        text,
        gold,
        divider: rgba(gold, 0.18),
        cta,
        ctaText: ctaTextFinal,
        border: gold,
        icon: gold,
        shadow: opts.shadow,
        cardOffsetY,
        photoFadePercent,
        glassBorder:
            opts.glassBorder ??
            (opts.darkUi ? rgba("#FFFFFF", 0.2) : rgba("#FFFFFF", 0.35)),
    };
}

function pickAlternateNativeAccent(analysis: ImageAnalysis): string {
    const sample =
        analysis.accentColors[1] ||
        analysis.dominantColors[2] ||
        analysis.dominantColors[1] ||
        analysis.accentColors[0] ||
        analysis.dominantColors[0] ||
        "#C8A66A";
    return polishAccent(sample);
}

/**
 * Fourth flow: palette + glass + accents from the photo.
 * Expression 0 = Soft (harmony), Expression 1 = Bold (alternate layout + shade).
 * Re-analyze flips between the two; the other three themes stay stable.
 */
function buildImaginativeTheme(
    analysis: ImageAnalysis,
    expression: ImaginativeExpression = 0,
): GeneratedThemeTokens {
    const dominant = analysis.dominantColors[0] || "#8A7A6A";
    const secondary = analysis.dominantColors[1] || dominant;
    const baseDark = analysis.brightness < 0.38 || analysis.shadowRatio > 0.32;

    if (expression === 0) {
        const darkUi = baseDark;
        const background = liftToSurface(dominant, darkUi ? "dark" : "light");
        const glassFill = darkUi
            ? mixHex(liftToSurface(secondary, "dark"), "#1A1A1A", 0.35)
            : mixHex(liftToSurface(secondary, "light"), "#FFFFFF", 0.45);
        const accent = pickImageNativeAccent(analysis);
        const glassBorder = darkUi
            ? rgba(accent, 0.35)
            : rgba("#FFFFFF", 0.28);

        return buildTheme(
            "imaginative",
            "Imaginative · Soft",
            "Expression 1 of 2 — soft photo-native palette. Re-analyze for Bold.",
            analysis,
            {
                background,
                glassFill,
                glassOpacity: darkUi ? 0.4 : 0.28 + analysis.saturation * 0.08,
                glassBlur: 16 + Math.round(analysis.complexity * 12),
                gradientStrength: clamp(0.4 + analysis.contrast * 0.35, 0.35, 0.75),
                gold: accent,
                shadow: darkUi ? 16 : 10 + Math.round(analysis.complexity * 6),
                darkUi,
                glassBorder,
                expression: 0,
            },
        );
    }

    // Expression B — Bold: secondary-led surface, flipped mid-tone UI, alternate layout
    const darkUi = !baseDark && analysis.brightness < 0.62 ? true : baseDark;
    const lead = secondary;
    const support = dominant;
    const background = liftToSurface(lead, darkUi ? "dark" : "light");
    const glassFill = darkUi
        ? mixHex(liftToSurface(support, "dark"), "#0F0F0F", 0.4)
        : mixHex(liftToSurface(support, "light"), "#F7F3EC", 0.55);
    const accent = pickAlternateNativeAccent(analysis);
    const glassBorder = darkUi ? rgba(accent, 0.45) : rgba(accent, 0.28);

    return buildTheme(
        "imaginative",
        "Imaginative · Bold",
        "Expression 2 of 2 — bolder shade + alternate card layout. Re-analyze for Soft.",
        analysis,
        {
            background,
            glassFill,
            glassOpacity: darkUi ? 0.48 : 0.34 + analysis.saturation * 0.1,
            glassBlur: 14 + Math.round(analysis.complexity * 10),
            gradientStrength: clamp(0.5 + analysis.contrast * 0.4, 0.45, 0.82),
            gold: accent,
            shadow: darkUi ? 18 : 12 + Math.round(analysis.complexity * 8),
            darkUi,
            glassBorder,
            cardOffsetY: suggestAlternateCardOffsetY(analysis),
            photoFadePercent: suggestAlternatePhotoFadePercent(analysis),
            expression: 1,
        },
    );
}

export function generateThemes(
    analysis: ImageAnalysis,
    options?: { imaginativeExpression?: ImaginativeExpression },
): GeneratedThemeTokens[] {
    const imaginativeExpression = options?.imaginativeExpression ?? 0;
    const accent = pickAccent(analysis);
    const ivory = softIvoryFrom(analysis.warmth, analysis.brightness);
    const coolIvory = mixHex(ivory, "#F4F6F8", 0.35);
    const darkBg = mixHex(
        analysis.dominantColors[0] || "#2C2C2C",
        "#1A1A1A",
        0.65,
    );

    const luxuryWarm = buildTheme(
        "luxury-warm",
        "Luxury Warm",
        "Warm ivory panel with champagne gold from the photo",
        analysis,
        {
            background: ivory,
            glassFill: "#FFFFFF",
            glassOpacity: 0.3 + analysis.warmth * 0.04,
            glassBlur: 20 + Math.round(analysis.complexity * 8),
            gradientStrength: 0.55,
            gold: accent,
            shadow: 10,
        },
    );

    const editorialIvory = buildTheme(
        "editorial-ivory",
        "Editorial Ivory",
        "Cleaner ivory, softer glass, refined gold accents",
        analysis,
        {
            background: coolIvory,
            glassFill: "#FFFFFF",
            glassOpacity: 0.26,
            glassBlur: 22,
            gradientStrength: 0.45,
            gold: mixHex(accent, "#C8A66A", 0.4),
            shadow: 8,
        },
    );

    const darkBoutique = buildTheme(
        "dark-boutique",
        "Dark Boutique",
        "Charcoal editorial with luminous champagne type",
        analysis,
        {
            background: darkBg,
            glassFill: "#1F1F1F",
            glassOpacity: 0.42,
            glassBlur: 18,
            gradientStrength: 0.65,
            gold: mixHex(accent, "#E8D5A3", 0.35),
            shadow: 14,
            darkUi: true,
        },
    );

    const imaginative = buildImaginativeTheme(analysis, imaginativeExpression);

    return [luxuryWarm, editorialIvory, darkBoutique, imaginative];
}

export function nextImaginativeExpression(
    current: ImaginativeExpression | undefined,
): ImaginativeExpression {
    return current === 1 ? 0 : 1;
}

export function pickRecommendedIndex(
    analysis: ImageAnalysis,
    themes: GeneratedThemeTokens[],
): number {
    const find = (id: SmartThemeId) => themes.findIndex((t) => t.id === id);

    // Moody / dark photos → Dark Boutique
    if (analysis.brightness < 0.32 || analysis.shadowRatio > 0.35) {
        return find("dark-boutique");
    }

    // Strong unique colour character → Imaginative (photo-native)
    const vivid =
        analysis.saturation > 0.28 ||
        (analysis.saturation > 0.18 && Math.abs(analysis.warmth) < 0.08);
    if (vivid) {
        return find("imaginative");
    }

    // Warm bright interiors → Luxury Warm
    if (analysis.warmth > 0.12 && analysis.brightness > 0.4) {
        return find("luxury-warm");
    }

    return find("editorial-ivory");
}

export function buildRecommendations(
    analysis: ImageAnalysis,
    theme: GeneratedThemeTokens,
): SmartRecommendation[] {
    const items: SmartRecommendation[] = [];
    const isImaginative = theme.id === "imaginative";

    if (analysis.warmth > 0.12) {
        items.push({
            id: "warm",
            message: "Warm apartment tones detected",
            tone: "success",
        });
    } else if (analysis.warmth < -0.1) {
        items.push({
            id: "cool",
            message: "Cool / neutral lighting detected",
            tone: "info",
        });
    }

    if (analysis.highlightRatio > 0.12 && analysis.brightness > 0.45) {
        items.push({
            id: "natural-light",
            message: "Natural lighting detected",
            tone: "success",
        });
    }

    if (isImaginative) {
        items.push({
            id: "native",
            message:
                theme.expression === 1
                    ? "Imaginative Bold — alternate shade + layout (re-analyze for Soft)"
                    : "Imaginative Soft — photo-native palette (re-analyze for Bold)",
            tone: "success",
        });
        items.push({
            id: "accent",
            message: `Accent from image (${theme.gold})`,
            tone: "success",
        });
    } else {
        items.push({
            id: "gold",
            message: `Gold accents recommended (${theme.gold})`,
            tone: "success",
        });
    }

    items.push({
        id: "glass",
        message: `Medium glass opacity (${Math.round(theme.glassOpacity * 100)}%)`,
        tone: "success",
    });

    items.push({
        id: "bg",
        message: `${theme.label} background selected (${theme.background})`,
        tone: "success",
    });

    items.push({
        id: "layout",
        message: describeLayoutChoice(analysis, theme.cardOffsetY),
        tone: "success",
    });

    if (analysis.complexity > 0.5) {
        items.push({
            id: "busy",
            message: "Busy scene — glass blur increased for readability",
            tone: "info",
        });
    }

    return items;
}
