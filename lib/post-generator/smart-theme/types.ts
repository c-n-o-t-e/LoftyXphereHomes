import type { PostDocument } from "@/lib/post-generator/types";

/** Grid cell complexity for layout decisions (0 = empty, 1 = busy). */
export type RegionScore = {
    row: number;
    col: number;
    complexity: number;
    brightness: number;
};

export type ImageAnalysis = {
    width: number;
    height: number;
    /** 0–1 mean luminance */
    brightness: number;
    /** 0–1 luminance std-ish */
    contrast: number;
    /** 0–1 mean HSV saturation */
    saturation: number;
    /** −1 cool … +1 warm (R−B bias) */
    warmth: number;
    /** Rough white-balance bias (−1 magenta … +1 green) */
    whiteBalance: number;
    dominantColors: string[];
    accentColors: string[];
    /** 0–1 share of very dark pixels */
    shadowRatio: number;
    /** 0–1 share of very bright pixels */
    highlightRatio: number;
    /** Mean edge magnitude 0–1 */
    edgeDensity: number;
    /** Overall visual busyness 0–1 */
    complexity: number;
    /** Where detail concentrates (normalized 0–1) */
    subjectCentroid: { x: number; y: number };
    /** Lowest-complexity cells (good overlay targets) */
    emptyRegions: RegionScore[];
    /** Highest-complexity cells (avoid covering) */
    busyRegions: RegionScore[];
    /** Lower-band complexity profile (for card overlap) */
    lowerBandComplexity: number[];
};

export type SmartThemeId =
    | "luxury-warm"
    | "editorial-ivory"
    | "dark-boutique"
    | "imaginative";

/** Imaginative has two alternating expressions (toggled on re-analyze). */
export type ImaginativeExpression = 0 | 1;

export type GeneratedThemeTokens = {
    id: SmartThemeId;
    label: string;
    description: string;
    /** Present on imaginative themes: which of the two expressions */
    expression?: ImaginativeExpression;
    background: string;
    glassFill: string;
    glassOpacity: number;
    glassBlur: number;
    gradientStrength: number;
    text: string;
    gold: string;
    divider: string;
    cta: string;
    ctaText: string;
    border: string;
    icon: string;
    shadow: number;
    /** Glass card vertical offset (px, negative = up) */
    cardOffsetY: number;
    /** Soft photo fade % */
    photoFadePercent: number;
    glassBorder: string;
};

export type SmartRecommendation = {
    id: string;
    message: string;
    tone: "info" | "success" | "warn";
};

export type SmartThemeResult = {
    imageKey: string;
    analyzedAt: number;
    analysis: ImageAnalysis;
    themes: GeneratedThemeTokens[];
    /** Index into themes — best automatic pick */
    recommendedIndex: number;
    recommendations: SmartRecommendation[];
    /** Which Imaginative shade is currently in the themes list (0 ↔ 1 on re-analyze) */
    imaginativeExpression: ImaginativeExpression;
};

/** Document fields the engine may set (admin can override afterward). */
export type SmartThemePatch = Partial<PostDocument>;
