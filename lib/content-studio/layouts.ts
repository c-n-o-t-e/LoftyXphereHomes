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
    | "overlay";

export type LayoutZone = {
    type: LayoutZoneType;
    rect: StudioRect;
    align?: "left" | "center" | "right";
    columns?: number;
    opacity?: number;
};

export type LayoutDefinition = {
    id: LayoutId;
    letter: "A" | "B" | "C" | "D" | "E" | "F" | "G";
    name: string;
    description: string;
    categories: ContentCategory[];
    footer: FooterVariant;
    assetStyle: "lxh-editorial";
    theme: ThemeId;
    imagePosition: "left" | "right" | "center" | "hero" | "accent";
    textPosition: "left" | "right" | "center" | "overlay";
    showFrame: boolean;
    heroBleed: boolean;
    typography: StudioTypography;
    defaultAsset: {
        x: number;
        y: number;
        width: number;
        height: number;
        rotation: number;
        scale: number;
        shadow: number;
    };
    zones: LayoutZone[];
};

const TYPE_EDITORIAL: StudioTypography = {
    titleSize: 64,
    titleWeight: 500,
    titleTracking: -0.02,
    titleLineHeight: 1.08,
    bodySize: 20,
    kickerSize: 13,
    ctaSize: 13,
};

const TYPE_MAGAZINE: StudioTypography = {
    titleSize: 56,
    titleWeight: 500,
    titleTracking: -0.018,
    titleLineHeight: 1.06,
    bodySize: 17,
    kickerSize: 12,
    ctaSize: 12,
};

const TYPE_MINIMAL: StudioTypography = {
    titleSize: 72,
    titleWeight: 500,
    titleTracking: -0.03,
    titleLineHeight: 1.05,
    bodySize: 18,
    kickerSize: 12,
    ctaSize: 12,
};

const TYPE_GRID: StudioTypography = {
    titleSize: 42,
    titleWeight: 500,
    titleTracking: -0.015,
    titleLineHeight: 1.1,
    bodySize: 16,
    kickerSize: 12,
    ctaSize: 12,
};

export const LAYOUT_DEFINITIONS: Record<LayoutId, LayoutDefinition> = {
    "editorial-split": {
        id: "editorial-split",
        letter: "A",
        name: "Editorial Split",
        description: "Headline left, transparent asset right, micro footer.",
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
        theme: "luxury-editorial",
        imagePosition: "right",
        textPosition: "left",
        showFrame: true,
        heroBleed: false,
        typography: TYPE_EDITORIAL,
        defaultAsset: {
            x: 760,
            y: 620,
            width: 460,
            height: 520,
            rotation: 0,
            scale: 1,
            shadow: 28,
        },
        zones: [
            { type: "kicker", rect: { x: 72, y: 88, w: 460, h: 36 }, align: "left" },
            { type: "title", rect: { x: 72, y: 140, w: 480, h: 520 }, align: "left" },
            { type: "body", rect: { x: 72, y: 700, w: 440, h: 220 }, align: "left" },
            { type: "asset", rect: { x: 540, y: 180, w: 480, h: 860 } },
            { type: "cta", rect: { x: 72, y: 980, w: 420, h: 56 }, align: "left" },
            { type: "logo", rect: { x: 72, y: 1188, w: 160, h: 48 }, align: "left" },
            { type: "footer", rect: { x: 260, y: 1196, w: 748, h: 40 }, align: "right" },
        ],
    },
    "full-bleed": {
        id: "full-bleed",
        letter: "B",
        name: "Full-Bleed Editorial",
        description: "Hero visual dominates. Type sits on a controlled overlay.",
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
        theme: "luxury-editorial",
        imagePosition: "hero",
        textPosition: "overlay",
        showFrame: false,
        heroBleed: true,
        typography: {
            ...TYPE_EDITORIAL,
            titleSize: 52,
        },
        defaultAsset: {
            x: 540,
            y: 520,
            width: 980,
            height: 1100,
            rotation: 0,
            scale: 1,
            shadow: 0,
        },
        zones: [
            { type: "asset", rect: { x: 0, y: 0, w: 1080, h: 1350 } },
            {
                type: "overlay",
                rect: { x: 56, y: 780, w: 968, h: 490 },
                opacity: 0.88,
            },
            { type: "kicker", rect: { x: 88, y: 812, w: 880, h: 32 }, align: "left" },
            { type: "title", rect: { x: 88, y: 856, w: 900, h: 220 }, align: "left" },
            { type: "cta", rect: { x: 88, y: 1100, w: 420, h: 48 }, align: "left" },
            { type: "logo", rect: { x: 88, y: 1188, w: 140, h: 40 }, align: "left" },
            { type: "footer", rect: { x: 520, y: 1196, w: 480, h: 36 }, align: "right" },
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
        theme: "luxury-editorial",
        imagePosition: "accent",
        textPosition: "center",
        showFrame: true,
        heroBleed: false,
        typography: TYPE_MINIMAL,
        defaultAsset: {
            x: 540,
            y: 1040,
            width: 220,
            height: 180,
            rotation: 0,
            scale: 1,
            shadow: 16,
        },
        zones: [
            { type: "kicker", rect: { x: 120, y: 160, w: 840, h: 32 }, align: "center" },
            { type: "title", rect: { x: 100, y: 280, w: 880, h: 520 }, align: "center" },
            { type: "body", rect: { x: 180, y: 820, w: 720, h: 80 }, align: "center" },
            { type: "asset", rect: { x: 400, y: 920, w: 280, h: 200 } },
            { type: "logo", rect: { x: 440, y: 1200, w: 200, h: 40 }, align: "center" },
            { type: "footer", rect: { x: 340, y: 1244, w: 400, h: 28 }, align: "center" },
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
        theme: "warm-hospitality",
        imagePosition: "right",
        textPosition: "left",
        showFrame: true,
        heroBleed: false,
        typography: {
            ...TYPE_EDITORIAL,
            titleSize: 54,
        },
        defaultAsset: {
            x: 720,
            y: 640,
            width: 500,
            height: 560,
            rotation: -4,
            scale: 1,
            shadow: 36,
        },
        zones: [
            { type: "kicker", rect: { x: 72, y: 96, w: 500, h: 32 }, align: "left" },
            { type: "title", rect: { x: 72, y: 150, w: 520, h: 360 }, align: "left" },
            { type: "body", rect: { x: 72, y: 540, w: 460, h: 280 }, align: "left" },
            { type: "asset", rect: { x: 500, y: 220, w: 540, h: 860 } },
            { type: "cta", rect: { x: 72, y: 980, w: 400, h: 52 }, align: "left" },
            { type: "logo", rect: { x: 72, y: 1192, w: 150, h: 40 }, align: "left" },
            { type: "footer", rect: { x: 280, y: 1200, w: 728, h: 36 }, align: "right" },
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
        theme: "luxury-editorial",
        imagePosition: "right",
        textPosition: "left",
        showFrame: true,
        heroBleed: false,
        typography: TYPE_MAGAZINE,
        defaultAsset: {
            x: 800,
            y: 360,
            width: 380,
            height: 380,
            rotation: 0,
            scale: 1,
            shadow: 22,
        },
        zones: [
            { type: "kicker", rect: { x: 72, y: 80, w: 560, h: 28 }, align: "left" },
            { type: "title", rect: { x: 72, y: 120, w: 620, h: 280 }, align: "left" },
            { type: "asset", rect: { x: 640, y: 96, w: 380, h: 400 } },
            { type: "points", rect: { x: 72, y: 560, w: 936, h: 560 }, columns: 1 },
            { type: "cta", rect: { x: 72, y: 1144, w: 360, h: 40 }, align: "left" },
            { type: "logo", rect: { x: 72, y: 1216, w: 140, h: 36 }, align: "left" },
            { type: "footer", rect: { x: 360, y: 1220, w: 648, h: 32 }, align: "right" },
        ],
    },
    "information-grid": {
        id: "information-grid",
        letter: "F",
        name: "Information Grid",
        description: "Clean numbered points with consistent iconography.",
        categories: [
            "educational",
            "guest-tips",
            "hospitality",
            "business-travel",
            "wellness",
        ],
        footer: "full",
        assetStyle: "lxh-editorial",
        theme: "warm-hospitality",
        imagePosition: "accent",
        textPosition: "left",
        showFrame: true,
        heroBleed: false,
        typography: TYPE_GRID,
        defaultAsset: {
            x: 940,
            y: 160,
            width: 140,
            height: 140,
            rotation: 0,
            scale: 1,
            shadow: 10,
        },
        zones: [
            { type: "kicker", rect: { x: 72, y: 80, w: 700, h: 28 }, align: "left" },
            { type: "title", rect: { x: 72, y: 118, w: 780, h: 160 }, align: "left" },
            { type: "asset", rect: { x: 880, y: 80, w: 128, h: 128 } },
            { type: "points", rect: { x: 72, y: 320, w: 936, h: 800 }, columns: 1 },
            { type: "logo", rect: { x: 72, y: 1208, w: 140, h: 36 }, align: "left" },
            { type: "footer", rect: { x: 240, y: 1212, w: 768, h: 36 }, align: "right" },
        ],
    },
    "minimal-luxury": {
        id: "minimal-luxury",
        letter: "G",
        name: "Minimal Luxury",
        description: "Restraint as luxury. Large type, tiny mark, one object.",
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
        theme: "luxury-editorial",
        imagePosition: "accent",
        textPosition: "center",
        showFrame: true,
        heroBleed: false,
        typography: TYPE_MINIMAL,
        defaultAsset: {
            x: 540,
            y: 980,
            width: 180,
            height: 160,
            rotation: 0,
            scale: 1,
            shadow: 14,
        },
        zones: [
            { type: "kicker", rect: { x: 160, y: 220, w: 760, h: 28 }, align: "center" },
            { type: "title", rect: { x: 90, y: 320, w: 900, h: 420 }, align: "center" },
            { type: "subtitle", rect: { x: 200, y: 760, w: 680, h: 80 }, align: "center" },
            { type: "asset", rect: { x: 450, y: 880, w: 180, h: 180 } },
            { type: "logo", rect: { x: 470, y: 1208, w: 140, h: 32 }, align: "center" },
            { type: "footer", rect: { x: 340, y: 1248, w: 400, h: 24 }, align: "center" },
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
