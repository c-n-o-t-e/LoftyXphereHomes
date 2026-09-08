import type {
    ContentCategory,
    FooterVariant,
    LayoutId,
    StudioRect,
    StudioTypography,
    ThemeId,
} from "@/lib/content-studio/types";

export type LayoutZoneType =
    | "kicker"
    | "title"
    | "subtitle"
    | "body"
    | "points"
    | "asset"
    | "cta"
    | "logo"
    | "footer"
    | "overlay"
    | "text-stack"
    | "rule"
    | "mark";

export type StackPart = "kicker" | "title" | "subtitle" | "body" | "cta" | "rule" | "mark";

export type AssetTreatment = "cutout" | "hero" | "object" | "accent";
export type HeadlineSize = "display" | "large" | "editorial" | "compact";
export type HeadlineCase = "preserve" | "display-stack";
export type PointsStyle = "magazine" | "grid" | "none";
export type OverlayStyle = "none" | "panel" | "gradient";

export type LayoutZone = {
    type: LayoutZoneType;
    rect: StudioRect;
    align?: "left" | "center" | "right";
    columns?: number;
    opacity?: number;
    include?: StackPart[];
};

export type LayoutAssetDefaults = {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scale: number;
    opacity: number;
    shadow: number;
    shadowOpacity: number;
    shadowBlur: number;
    shadowScale: number;
    shadowOffsetY: number;
};

export type LayoutDefinition = {
    id: LayoutId;
    letter: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    name: string;
    description: string;
    categories: ContentCategory[];
    footer: FooterVariant;
    assetStyle: "lxh-editorial";
    assetTreatment: AssetTreatment;
    headlineSize: HeadlineSize;
    headlineCase: HeadlineCase;
    pointsStyle: PointsStyle;
    overlayStyle: OverlayStyle;
    showCta: boolean;
    theme: ThemeId;
    imagePosition: "left" | "right" | "center" | "hero" | "accent";
    textPosition: "left" | "right" | "center" | "overlay";
    showFrame: boolean;
    heroBleed: boolean;
    showGrain: boolean;
    showVignette: boolean;
    typography: StudioTypography;
    defaultAsset: LayoutAssetDefaults;
    zones: LayoutZone[];
};

const TYPE_EDITORIAL: StudioTypography = {
    titleSize: 86,
    titleWeight: 500,
    titleTracking: -0.028,
    titleLineHeight: 1.02,
    bodySize: 22,
    kickerSize: 13,
    ctaSize: 13,
};

const TYPE_MAGAZINE: StudioTypography = {
    titleSize: 58,
    titleWeight: 500,
    titleTracking: -0.022,
    titleLineHeight: 1.05,
    bodySize: 17,
    kickerSize: 12,
    ctaSize: 12,
};

const TYPE_MINIMAL: StudioTypography = {
    titleSize: 118,
    titleWeight: 500,
    titleTracking: -0.035,
    titleLineHeight: 0.96,
    bodySize: 20,
    kickerSize: 12,
    ctaSize: 12,
};

const TYPE_DISPLAY: StudioTypography = {
    titleSize: 96,
    titleWeight: 500,
    titleTracking: -0.032,
    titleLineHeight: 0.98,
    bodySize: 20,
    kickerSize: 13,
    ctaSize: 12,
};

const TYPE_GRID: StudioTypography = {
    titleSize: 48,
    titleWeight: 500,
    titleTracking: -0.02,
    titleLineHeight: 1.08,
    bodySize: 16,
    kickerSize: 12,
    ctaSize: 12,
};

const TYPE_BLEED: StudioTypography = {
    titleSize: 62,
    titleWeight: 500,
    titleTracking: -0.024,
    titleLineHeight: 1.04,
    bodySize: 20,
    kickerSize: 13,
    ctaSize: 13,
};

const CUTOUT_SHADOW = {
    opacity: 1,
    shadow: 40,
    shadowOpacity: 0.2,
    shadowBlur: 52,
    shadowScale: 0.68,
    shadowOffsetY: 36,
};

const OBJECT_SHADOW = {
    opacity: 1,
    shadow: 18,
    shadowOpacity: 0.16,
    shadowBlur: 28,
    shadowScale: 0.7,
    shadowOffsetY: 18,
};

export const LAYOUT_DEFINITIONS: Record<LayoutId, LayoutDefinition> = {
    "editorial-split": {
        id: "editorial-split",
        letter: "A",
        name: "Editorial Split",
        description: "Headline left, large transparent asset right.",
        categories: [
            "new-week",
            "new-month",
            "inspirational",
            "educational",
            "hospitality",
            "holiday",
            "lifestyle",
            "travel-tips",
        ],
        footer: "micro",
        assetStyle: "lxh-editorial",
        assetTreatment: "cutout",
        headlineSize: "large",
        headlineCase: "preserve",
        pointsStyle: "none",
        overlayStyle: "none",
        showCta: true,
        theme: "luxury-editorial",
        imagePosition: "right",
        textPosition: "left",
        showFrame: true,
        heroBleed: false,
        showGrain: true,
        showVignette: false,
        typography: TYPE_EDITORIAL,
        defaultAsset: {
            x: 790,
            y: 760,
            width: 560,
            height: 700,
            rotation: 0,
            scale: 1.08,
            ...CUTOUT_SHADOW,
        },
        zones: [
            {
                type: "text-stack",
                rect: { x: 64, y: 92, w: 500, h: 1020 },
                align: "left",
                include: ["kicker", "title", "rule", "body", "cta"],
            },
            { type: "asset", rect: { x: 500, y: 140, w: 540, h: 1020 } },
            { type: "logo", rect: { x: 64, y: 1224, w: 132, h: 40 }, align: "left" },
            { type: "footer", rect: { x: 220, y: 1230, w: 796, h: 32 }, align: "right" },
        ],
    },
    "full-bleed": {
        id: "full-bleed",
        letter: "B",
        name: "Full-Bleed Editorial",
        description: "Hero visual dominates. Type sits inside the photograph.",
        categories: [
            "educational",
            "travel-tips",
            "abuja-guide",
            "announcement",
            "local-discovery",
            "holiday",
        ],
        footer: "website-only",
        assetStyle: "lxh-editorial",
        assetTreatment: "hero",
        headlineSize: "editorial",
        headlineCase: "preserve",
        pointsStyle: "none",
        overlayStyle: "gradient",
        showCta: true,
        theme: "luxury-editorial",
        imagePosition: "hero",
        textPosition: "overlay",
        showFrame: false,
        heroBleed: true,
        showGrain: true,
        showVignette: true,
        typography: TYPE_BLEED,
        defaultAsset: {
            x: 540,
            y: 675,
            width: 1080,
            height: 1350,
            rotation: 0,
            scale: 1,
            opacity: 1,
            shadow: 0,
            shadowOpacity: 0,
            shadowBlur: 0,
            shadowScale: 1,
            shadowOffsetY: 0,
        },
        zones: [
            { type: "asset", rect: { x: 0, y: 0, w: 1080, h: 1350 } },
            {
                type: "overlay",
                rect: { x: 0, y: 560, w: 1080, h: 790 },
                opacity: 0.92,
            },
            {
                type: "text-stack",
                rect: { x: 72, y: 760, w: 936, h: 430 },
                align: "left",
                include: ["kicker", "title", "body", "cta"],
            },
            { type: "logo", rect: { x: 72, y: 1232, w: 120, h: 36 }, align: "left" },
            { type: "footer", rect: { x: 520, y: 1238, w: 488, h: 28 }, align: "right" },
        ],
    },
    "typography-first": {
        id: "typography-first",
        letter: "C",
        name: "Typography First",
        description: "Magazine statement. Large type, one supporting object.",
        categories: [
            "inspirational",
            "hospitality",
            "new-week",
            "new-month",
            "holiday",
        ],
        footer: "logo-only",
        assetStyle: "lxh-editorial",
        assetTreatment: "object",
        headlineSize: "display",
        headlineCase: "display-stack",
        pointsStyle: "none",
        overlayStyle: "none",
        showCta: false,
        theme: "luxury-editorial",
        imagePosition: "accent",
        textPosition: "center",
        showFrame: true,
        heroBleed: false,
        showGrain: true,
        showVignette: false,
        typography: TYPE_DISPLAY,
        defaultAsset: {
            x: 730,
            y: 1120,
            width: 240,
            height: 210,
            rotation: 8,
            scale: 1,
            ...OBJECT_SHADOW,
        },
        zones: [
            {
                type: "text-stack",
                rect: { x: 88, y: 168, w: 904, h: 820 },
                align: "center",
                include: ["kicker", "title", "rule", "body"],
            },
            { type: "asset", rect: { x: 600, y: 980, w: 280, h: 220 } },
            { type: "logo", rect: { x: 440, y: 1236, w: 200, h: 32 }, align: "center" },
            { type: "footer", rect: { x: 340, y: 1274, w: 400, h: 22 }, align: "center" },
        ],
    },
    "cut-out": {
        id: "cut-out",
        letter: "D",
        name: "Cut-Out Asset",
        description: "Isolated subject floats in the composition.",
        categories: [
            "travel-tips",
            "lifestyle",
            "guest-tips",
            "wellness",
            "business-travel",
            "local-discovery",
        ],
        footer: "micro",
        assetStyle: "lxh-editorial",
        assetTreatment: "cutout",
        headlineSize: "large",
        headlineCase: "preserve",
        pointsStyle: "none",
        overlayStyle: "none",
        showCta: true,
        theme: "warm-hospitality",
        imagePosition: "right",
        textPosition: "left",
        showFrame: true,
        heroBleed: false,
        showGrain: true,
        showVignette: false,
        typography: {
            ...TYPE_EDITORIAL,
            titleSize: 68,
            bodySize: 21,
        },
        defaultAsset: {
            x: 700,
            y: 860,
            width: 620,
            height: 760,
            rotation: -5,
            scale: 1.12,
            ...CUTOUT_SHADOW,
            shadowScale: 0.62,
            shadowOffsetY: 42,
        },
        zones: [
            {
                type: "text-stack",
                rect: { x: 64, y: 88, w: 520, h: 900 },
                align: "left",
                include: ["kicker", "title", "rule", "body", "cta"],
            },
            { type: "asset", rect: { x: 420, y: 220, w: 620, h: 980 } },
            { type: "logo", rect: { x: 64, y: 1228, w: 128, h: 36 }, align: "left" },
            { type: "footer", rect: { x: 220, y: 1234, w: 796, h: 28 }, align: "right" },
        ],
    },
    "magazine-editorial": {
        id: "magazine-editorial",
        letter: "E",
        name: "Magazine Editorial",
        description: "Series kicker, large title, visual, numbered notes.",
        categories: [
            "educational",
            "travel-tips",
            "abuja-guide",
            "guest-tips",
            "lifestyle",
            "local-discovery",
            "business-travel",
        ],
        footer: "micro",
        assetStyle: "lxh-editorial",
        assetTreatment: "cutout",
        headlineSize: "editorial",
        headlineCase: "preserve",
        pointsStyle: "magazine",
        overlayStyle: "none",
        showCta: true,
        theme: "luxury-editorial",
        imagePosition: "right",
        textPosition: "left",
        showFrame: true,
        heroBleed: false,
        showGrain: true,
        showVignette: false,
        typography: TYPE_MAGAZINE,
        defaultAsset: {
            x: 820,
            y: 300,
            width: 420,
            height: 420,
            rotation: 3,
            scale: 1.05,
            ...CUTOUT_SHADOW,
            shadowBlur: 36,
            shadowOffsetY: 22,
        },
        zones: [
            {
                type: "text-stack",
                rect: { x: 64, y: 72, w: 620, h: 340 },
                align: "left",
                include: ["kicker", "title"],
            },
            { type: "asset", rect: { x: 620, y: 64, w: 400, h: 380 } },
            { type: "points", rect: { x: 64, y: 460, w: 952, h: 700 }, columns: 1 },
            { type: "cta", rect: { x: 64, y: 1178, w: 400, h: 36 }, align: "left" },
            { type: "logo", rect: { x: 64, y: 1232, w: 120, h: 32 }, align: "left" },
            { type: "footer", rect: { x: 280, y: 1236, w: 736, h: 28 }, align: "right" },
        ],
    },
    "information-grid": {
        id: "information-grid",
        letter: "F",
        name: "Information Grid",
        description: "Numbered insights in a refined editorial grid.",
        categories: [
            "educational",
            "guest-tips",
            "hospitality",
            "business-travel",
            "wellness",
        ],
        footer: "full",
        assetStyle: "lxh-editorial",
        assetTreatment: "accent",
        headlineSize: "compact",
        headlineCase: "preserve",
        pointsStyle: "grid",
        overlayStyle: "none",
        showCta: false,
        theme: "warm-hospitality",
        imagePosition: "accent",
        textPosition: "left",
        showFrame: true,
        heroBleed: false,
        showGrain: true,
        showVignette: false,
        typography: TYPE_GRID,
        defaultAsset: {
            x: 940,
            y: 148,
            width: 160,
            height: 160,
            rotation: 0,
            scale: 1,
            ...OBJECT_SHADOW,
        },
        zones: [
            {
                type: "text-stack",
                rect: { x: 64, y: 72, w: 760, h: 200 },
                align: "left",
                include: ["kicker", "title"],
            },
            { type: "asset", rect: { x: 860, y: 72, w: 156, h: 156 } },
            { type: "points", rect: { x: 64, y: 300, w: 952, h: 860 }, columns: 2 },
            { type: "logo", rect: { x: 64, y: 1224, w: 120, h: 32 }, align: "left" },
            { type: "footer", rect: { x: 220, y: 1228, w: 796, h: 32 }, align: "right" },
        ],
    },
    "minimal-luxury": {
        id: "minimal-luxury",
        letter: "G",
        name: "Minimal Luxury",
        description: "Restraint as luxury. Huge type, one object, tiny mark.",
        categories: [
            "new-week",
            "new-month",
            "holiday",
            "inspirational",
            "announcement",
            "hospitality",
        ],
        footer: "logo-only",
        assetStyle: "lxh-editorial",
        assetTreatment: "object",
        headlineSize: "display",
        headlineCase: "display-stack",
        pointsStyle: "none",
        overlayStyle: "none",
        showCta: false,
        theme: "luxury-editorial",
        imagePosition: "accent",
        textPosition: "center",
        showFrame: true,
        heroBleed: false,
        showGrain: true,
        showVignette: false,
        typography: TYPE_MINIMAL,
        defaultAsset: {
            x: 820,
            y: 1124,
            width: 220,
            height: 190,
            rotation: -8,
            scale: 1,
            ...OBJECT_SHADOW,
        },
        zones: [
            {
                type: "text-stack",
                rect: { x: 80, y: 180, w: 920, h: 780 },
                align: "center",
                include: ["kicker", "title", "rule", "subtitle", "mark"],
            },
            { type: "asset", rect: { x: 700, y: 1000, w: 250, h: 210 } },
            { type: "logo", rect: { x: 470, y: 1244, w: 140, h: 28 }, align: "center" },
            { type: "footer", rect: { x: 340, y: 1278, w: 400, h: 20 }, align: "center" },
        ],
    },
};

export const LAYOUT_LIST = Object.values(LAYOUT_DEFINITIONS);

export function getLayout(id: LayoutId): LayoutDefinition {
    return LAYOUT_DEFINITIONS[id];
}

export function zoneOf(
    layout: LayoutDefinition,
    type: LayoutZoneType,
): LayoutZone | undefined {
    return layout.zones.find((zone) => zone.type === type);
}

export function expectedAssetCoverage(layout: LayoutDefinition): number {
    if (layout.assetTreatment === "hero") return 0.72;
    if (layout.assetTreatment === "cutout") return 0.22;
    if (layout.assetTreatment === "object") return 0.04;
    return 0.02;
}
