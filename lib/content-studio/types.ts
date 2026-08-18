/** Instagram portrait canvas (4:5). Primary Content Studio format. */
export const STUDIO_CANVAS_WIDTH = 1080;
export const STUDIO_CANVAS_HEIGHT = 1350;

export const STUDIO_FORMATS = {
    "portrait-4-5": { width: 1080, height: 1350, label: "Portrait 4:5" },
    "story-9-16": { width: 1080, height: 1920, label: "Story 9:16" },
    "square-1-1": { width: 1080, height: 1080, label: "Square 1:1" },
} as const;

export type StudioFormatId = keyof typeof STUDIO_FORMATS;

export const STUDIO_DOCUMENT_VERSION = 1 as const;
export type StudioDocumentVersion = typeof STUDIO_DOCUMENT_VERSION;

export type EditorialPostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export const CONTENT_CATEGORIES = [
    "educational",
    "travel-tips",
    "abuja-guide",
    "guest-tips",
    "hospitality",
    "lifestyle",
    "inspirational",
    "new-week",
    "new-month",
    "holiday",
    "announcement",
    "promotion",
    "local-discovery",
    "wellness",
    "business-travel",
] as const;

export type ContentCategory = (typeof CONTENT_CATEGORIES)[number];

export const LAYOUT_IDS = [
    "editorial-split",
    "full-bleed",
    "typography-first",
    "cut-out",
    "magazine-editorial",
    "information-grid",
    "minimal-luxury",
] as const;

export type LayoutId = (typeof LAYOUT_IDS)[number];

export const THEME_IDS = [
    "luxury-editorial",
    "warm-hospitality",
    "seasonal",
    "dark-editorial",
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const ASSET_CATEGORIES = [
    "travel",
    "hospitality",
    "lifestyle",
    "food",
    "abuja",
    "business",
    "wellness",
    "fitness",
    "technology",
    "celebrations",
    "seasonal",
    "accommodation",
] as const;

export type AssetCategory = (typeof ASSET_CATEGORIES)[number];

export const FOOTER_VARIANTS = [
    "full",
    "micro",
    "logo-only",
    "website-only",
] as const;

export type FooterVariant = (typeof FOOTER_VARIANTS)[number];

export const LOGO_VARIANTS = ["dark", "light", "gold"] as const;
export type LogoVariant = (typeof LOGO_VARIANTS)[number];

export type HeadingFont = "Playfair Display" | "Cormorant Garamond";
export type BodyFont = "Inter" | "Manrope";

export type StudioIconKey =
    | "map-pin"
    | "shield"
    | "zap"
    | "wifi"
    | "sparkles"
    | "key"
    | "suitcase"
    | "coffee"
    | "sun"
    | "moon"
    | "leaf"
    | "building"
    | "plane"
    | "book"
    | "heart"
    | "clock"
    | "star"
    | "globe";

export type StudioRect = {
    x: number;
    y: number;
    w: number;
    h: number;
};

export type StudioTheme = {
    id: ThemeId;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    gold: string;
    border: string;
    overlay: string;
    ctaBackground: string;
    ctaText: string;
};

export type StudioFonts = {
    heading: HeadingFont;
    body: BodyFont;
};

export type StudioContentPoint = {
    id: string;
    number: string;
    heading: string;
    body: string;
    icon: StudioIconKey;
};

export type StudioContent = {
    kicker: string;
    title: string;
    subtitle: string;
    body: string;
    cta: string;
    points: StudioContentPoint[];
    keywords: string[];
};

export type StudioAssetTransform = {
    url: string | null;
    concept: string;
    category: AssetCategory;
    /** Center X on the 1080-wide canvas. */
    x: number;
    /** Center Y on the 1350-tall canvas. */
    y: number;
    width: number;
    height: number;
    rotation: number;
    scale: number;
    shadow: number;
};

export type StudioLogo = {
    variant: LogoVariant;
    opacity: number;
    size: number;
    wordmark: string;
    showWordmark: boolean;
};

export type StudioFooter = {
    variant: FooterVariant;
    instagram: string;
    whatsapp: string;
    website: string;
};

export type StudioTypography = {
    titleSize: number;
    titleWeight: number;
    titleTracking: number;
    titleLineHeight: number;
    bodySize: number;
    kickerSize: number;
    ctaSize: number;
};

export type EditorialDocument = {
    version: StudioDocumentVersion;
    format: StudioFormatId;
    category: ContentCategory;
    layoutId: LayoutId;
    themeId: ThemeId;
    theme: StudioTheme;
    fonts: StudioFonts;
    typography: StudioTypography;
    content: StudioContent;
    asset: StudioAssetTransform;
    logo: StudioLogo;
    footer: StudioFooter;
};

export type EditorialPostRecord = {
    id: string;
    title: string;
    category: ContentCategory;
    layoutId: LayoutId;
    status: EditorialPostStatus;
    document: EditorialDocument;
    createdByEmail: string | null;
    createdAt: string;
    updatedAt: string;
};

export type EditorialAssetRecord = {
    id: string;
    name: string;
    category: AssetCategory;
    prompt: string;
    imageUrl: string;
    style: string;
    approved: boolean;
    favorite: boolean;
    createdByEmail: string | null;
    createdAt: string;
    updatedAt: string;
};

export type StudioExportFormat = "png" | "jpeg" | "webp";
export type StudioExportScale = 1 | 2;

export type LayoutRecommendation = {
    layoutId: LayoutId;
    alternatives: LayoutId[];
    themeId: ThemeId;
    visualConcept: string;
    visualConcepts: string[];
    assetCategory: AssetCategory;
    footer: FooterVariant;
    reason: string;
};

export type QualityIssue = {
    id: string;
    severity: "error" | "warning";
    message: string;
};

export type QualityReport = {
    ready: boolean;
    issues: QualityIssue[];
};

export type VisualAlternative = {
    concept: string;
    imageUrl: string;
    prompt: string;
};
