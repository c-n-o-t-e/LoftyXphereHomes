import { SITE_LOGO_PATH, SITE_CONTACT } from "@/lib/seo/constants";
import { INVOICE_WEBSITE_DISPLAY, SITE_NAME } from "@/lib/constants";
import type {
    PostAmenitiesStyle,
    PostAmenityItem,
    PostContactStyle,
    PostDocument,
    PostPresetKey,
    PostTheme,
} from "@/lib/post-generator/types";
import { POST_TOKENS } from "@/lib/post-generator/tokens";

/** Reference look: one row of 8, dark uppercase stacked labels, gold icons. */
export const DEFAULT_AMENITIES_STYLE: PostAmenitiesStyle = {
    columns: 8,
    iconSize: 36,
    strokeWidth: 2.1,
    fontSize: 9.5,
    fontWeight: 600,
    rowGap: 0,
    columnGap: POST_TOKENS.spacing.amenityColumnGap,
    iconLabelGap: 8,
    goldLabels: false,
};

export const DEFAULT_CONTACT_STYLE: PostContactStyle = {
    /** Sized for Instagram readability on a 1080px canvas (reference). */
    iconSize: 26,
    strokeWidth: 2.15,
    fontSize: 17,
    fontWeight: 500,
    gap: 12,
    paddingY: 14,
    iconColor: POST_TOKENS.colors.gold,
    textColor: POST_TOKENS.colors.text,
};

/** Warm ivory / champagne palette — approved reference. */
export const REFERENCE_THEME: PostTheme = {
    primary: POST_TOKENS.colors.text,
    accent: POST_TOKENS.colors.gold,
    gold: POST_TOKENS.colors.gold,
    background: POST_TOKENS.colors.ivory,
    text: POST_TOKENS.colors.text,
    divider: POST_TOKENS.colors.divider,
    button: POST_TOKENS.colors.gold,
    buttonText: POST_TOKENS.colors.white,
    icon: POST_TOKENS.colors.gold,
};

export const DEFAULT_AMENITIES: PostAmenityItem[] = [
    { id: "a1", label: "Starlink Internet", icon: "wifi", visible: true },
    { id: "a2", label: "24/7 Power", icon: "zap", visible: true },
    { id: "a3", label: "Swimming Pool", icon: "pool", visible: true },
    { id: "a4", label: "Fully Equipped Kitchen", icon: "kitchen", visible: true },
    { id: "a5", label: "Smart TV & PS5", icon: "gamepad", visible: true },
    { id: "a6", label: "Gym & Fitness", icon: "dumbbell", visible: true },
    { id: "a7", label: "Daily Cleaning", icon: "cleaning", visible: true },
    { id: "a8", label: "Washing Machine", icon: "washer", visible: true },
];

export const PRESET_META: Record<
    PostPresetKey,
    { label: string; description: string }
> = {
    "luxury-editorial": {
        label: "Luxury Editorial",
        description: "Approved reference — cream panel, gold accents, serif headline",
    },
    "luxury-classic": {
        label: "Luxury Classic",
        description: "Slightly warmer cream with stronger gold borders",
    },
    "luxury-gold": {
        label: "Luxury Gold",
        description: "Richer gold accents and denser champagne frame",
    },
    "boutique-hotel": {
        label: "Boutique Hotel",
        description: "Softer ivory panel with refined spacing",
    },
    minimal: {
        label: "Minimal",
        description: "Cleaner panel, lighter dividers, quieter gold",
    },
    "dark-luxury": {
        label: "Dark Luxury",
        description: "Charcoal panel with champagne type — same layout",
    },
};

function formatWhatsAppDisplay(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("234") && digits.length >= 13) {
        return `+234 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    }
    return phone;
}

export function createDefaultPostDocument(
    overrides: Partial<PostDocument> = {},
): PostDocument {
    const base: PostDocument = {
        version: 1,
        apartmentId: null,
        apartmentName: "",
        apartmentSlug: null,
        bookingUrl: null,
        layout: {
            outerPadding: POST_TOKENS.frame.borderInset,
            borderThickness: POST_TOKENS.frame.borderThickness,
            borderColor: POST_TOKENS.colors.gold,
            borderRadius: POST_TOKENS.frame.borderRadius,
            contentPaddingX: POST_TOKENS.spacing.contentPaddingX,
            contentPaddingTop: POST_TOKENS.spacing.contentPaddingTop,
            contentPaddingBottom: POST_TOKENS.spacing.contentPaddingBottom,
        },
        image: {
            url: null,
            sourceFileName: null,
            positionX: 50,
            positionY: 42,
            scale: 1,
            zoom: 1,
            panX: 0,
            panY: 0,
            cropTop: 0,
            cropRight: 0,
            cropBottom: 0,
            cropLeft: 0,
            brightness: 105,
            contrast: 105,
            saturation: 100,
            blur: 0,
            shadow: 0,
            borderRadius: 0,
        },
        overlay: {
            opacity: POST_TOKENS.glass.opacity,
            blur: POST_TOKENS.glass.blur,
            gradientStrength: 0.2,
            gradientDirection: "to-top",
            backgroundColor: POST_TOKENS.colors.white,
            borderRadius: POST_TOKENS.glass.borderRadius,
            borderThickness: POST_TOKENS.glass.borderThickness,
            borderColor: POST_TOKENS.colors.glassBorder,
            shadow: POST_TOKENS.glass.shadow,
            glassEffect: true,
            photoHeightPercent: POST_TOKENS.photo.heightPercent,
            overlapPercent: POST_TOKENS.photo.overlapPercent,
            photoFadePercent: POST_TOKENS.photo.fadePercent,
            cardInsetX: POST_TOKENS.glass.cardInsetX,
            footerGap: POST_TOKENS.spacing.footerGap,
            cardOffsetY: POST_TOKENS.glass.cardOffsetY,
        },
        headline: {
            line1: "Luxury",
            line2: "Beyond",
            accentWord: "Expectations.",
            showAccentDivider: false,
            fontSize: POST_TOKENS.type.headlineSize,
            fontWeight: 500,
            letterSpacing: -0.4,
            lineHeight: POST_TOKENS.type.headlineLineHeight,
            align: "left",
            color: POST_TOKENS.colors.text,
            accentColor: POST_TOKENS.colors.gold,
        },
        description: {
            text: "Premium serviced apartments designed for comfort, privacy and unforgettable stays.",
            fontSize: POST_TOKENS.type.bodySize,
            fontWeight: 400,
            letterSpacing: 0.1,
            lineHeight: 1.5,
            align: "left",
            color: POST_TOKENS.colors.textMuted,
            maxWidthPercent: 54,
        },
        button: {
            text: "BOOK YOUR STAY",
            showIcon: true,
            icon: "arrow-right",
            backgroundColor: POST_TOKENS.colors.gold,
            textColor: POST_TOKENS.colors.white,
            borderRadius: POST_TOKENS.type.ctaRadius,
            paddingX: POST_TOKENS.type.ctaPaddingX,
            paddingY: POST_TOKENS.type.ctaPaddingY,
            width: "auto",
            height: "auto",
            fontSize: POST_TOKENS.type.ctaSize,
            fontWeight: 600,
            letterSpacing: 0.8,
            hoverScale: 1.03,
        },
        amenities: DEFAULT_AMENITIES.map((a) => ({ ...a })),
        amenitiesStyle: { ...DEFAULT_AMENITIES_STYLE },
        logo: {
            url: SITE_LOGO_PATH,
            lightUrl: "/lofty-logo-white.png",
            darkUrl: SITE_LOGO_PATH,
            variant: "light",
            opacity: 0.9,
            size: 72,
            padding: 44,
            position: "top-left",
            showWordmark: true,
            wordmark: SITE_NAME.toUpperCase(),
        },
        contact: [
            {
                id: "c1",
                type: "instagram",
                label: "@loftyxpherehomes",
                visible: true,
            },
            {
                id: "c2",
                type: "whatsapp",
                label: formatWhatsAppDisplay(SITE_CONTACT.phone),
                visible: true,
            },
            {
                id: "c3",
                type: "website",
                label: INVOICE_WEBSITE_DISPLAY,
                visible: true,
            },
            {
                id: "c4",
                type: "email",
                label: SITE_CONTACT.email,
                visible: false,
            },
        ],
        contactStyle: { ...DEFAULT_CONTACT_STYLE },
        theme: { ...REFERENCE_THEME },
        fonts: {
            heading: "Playfair Display",
            body: "Manrope",
        },
    };

    return mergeDocumentWithDefaults(base, overrides);
}

type LegacyContactStyle = Partial<PostContactStyle> & { color?: unknown };

function mergeDocumentWithDefaults(
    base: PostDocument,
    overrides: Partial<PostDocument>,
): PostDocument {
    const overlay = {
        ...base.overlay,
        ...(overrides.overlay ?? {}),
    };
    if (overlay.photoFadePercent == null) {
        overlay.photoFadePercent = base.overlay.photoFadePercent;
    }
    if (overlay.cardOffsetY == null) {
        overlay.cardOffsetY = base.overlay.cardOffsetY;
    }

    const legacyContactRaw = overrides.contactStyle as LegacyContactStyle | undefined;
    const legacyContactColor =
        typeof legacyContactRaw?.color === "string" ? legacyContactRaw.color : undefined;

    let contactStyle: PostContactStyle = {
        ...base.contactStyle,
        ...(overrides.contactStyle ?? {}),
        iconColor:
            overrides.contactStyle?.iconColor ??
            legacyContactColor ??
            base.contactStyle.iconColor,
        textColor:
            overrides.contactStyle?.textColor ??
            legacyContactColor ??
            base.contactStyle.textColor,
    };
    if (!contactStyle.iconColor) {
        contactStyle = {
            ...contactStyle,
            iconColor: DEFAULT_CONTACT_STYLE.iconColor,
        };
    }
    if (!contactStyle.textColor) {
        contactStyle = {
            ...contactStyle,
            textColor: DEFAULT_CONTACT_STYLE.textColor,
        };
    }

    return {
        ...base,
        ...overrides,
        layout: { ...base.layout, ...(overrides.layout ?? {}) },
        image: { ...base.image, ...(overrides.image ?? {}) },
        overlay,
        headline: { ...base.headline, ...(overrides.headline ?? {}) },
        description: { ...base.description, ...(overrides.description ?? {}) },
        button: { ...base.button, ...(overrides.button ?? {}) },
        logo: { ...base.logo, ...(overrides.logo ?? {}) },
        theme: { ...base.theme, ...(overrides.theme ?? {}) },
        fonts: { ...base.fonts, ...(overrides.fonts ?? {}) },
        amenitiesStyle: {
            ...base.amenitiesStyle,
            ...(overrides.amenitiesStyle ?? {}),
        },
        contactStyle,
        amenities: overrides.amenities ?? base.amenities,
        contact: overrides.contact ?? base.contact,
    };
}

export function applyPreset(preset: PostPresetKey): PostDocument {
    const doc = createDefaultPostDocument();

    switch (preset) {
        case "luxury-editorial":
            return doc;
        case "luxury-classic":
            return createDefaultPostDocument({
                theme: {
                    ...REFERENCE_THEME,
                    background: "#F5F0E8",
                    gold: "#B8956A",
                    accent: "#B8956A",
                    button: "#B8956A",
                    icon: "#B8956A",
                },
                layout: {
                    ...doc.layout,
                    borderThickness: 3,
                    borderColor: "#B8956A",
                },
                headline: {
                    ...doc.headline,
                    accentColor: "#B8956A",
                },
                overlay: {
                    ...doc.overlay,
                    backgroundColor: "#F5F0E8",
                },
            });
        case "luxury-gold":
            return createDefaultPostDocument({
                theme: {
                    ...REFERENCE_THEME,
                    gold: "#D4AF37",
                    accent: "#D4AF37",
                    button: "#C9A227",
                    icon: "#D4AF37",
                },
                layout: {
                    ...doc.layout,
                    borderColor: "#D4AF37",
                    borderThickness: 3.5,
                },
                headline: { ...doc.headline, accentColor: "#D4AF37" },
                button: { ...doc.button, backgroundColor: "#C9A227" },
                overlay: {
                    ...doc.overlay,
                    borderThickness: 1,
                    borderColor: "#E8D5A3",
                },
            });
        case "boutique-hotel":
            return createDefaultPostDocument({
                overlay: {
                    ...doc.overlay,
                    backgroundColor: "#FAF8F4",
                    borderRadius: 36,
                    glassEffect: true,
                    opacity: 0.96,
                    blur: 8,
                },
                fonts: { heading: "Cormorant Garamond", body: "Manrope" },
                headline: { ...doc.headline, fontSize: 56, fontWeight: 600 },
            });
        case "minimal":
            return createDefaultPostDocument({
                layout: { ...doc.layout, borderThickness: 1.5 },
                theme: {
                    ...REFERENCE_THEME,
                    divider: "#EFEAE2",
                    gold: "#B8A078",
                    accent: "#B8A078",
                    button: "#B8A078",
                    icon: "#B8A078",
                },
                headline: {
                    ...doc.headline,
                    accentColor: "#B8A078",
                    showAccentDivider: false,
                },
                overlay: { ...doc.overlay, shadow: 4, overlapPercent: 6 },
            });
        case "dark-luxury":
            return createDefaultPostDocument({
                theme: {
                    primary: "#F7F3EC",
                    accent: POST_TOKENS.colors.gold,
                    gold: POST_TOKENS.colors.gold,
                    background: "#1A1A1A",
                    text: "#F2EDE6",
                    divider: "rgba(200,166,106,0.25)",
                    button: POST_TOKENS.colors.gold,
                    buttonText: "#1A1A1A",
                    icon: POST_TOKENS.colors.gold,
                },
                overlay: {
                    ...doc.overlay,
                    backgroundColor: "#2A2A2A",
                    glassEffect: true,
                    blur: 16,
                    opacity: 0.35,
                },
                headline: {
                    ...doc.headline,
                    color: "#F2EDE6",
                    accentColor: POST_TOKENS.colors.gold,
                },
                description: {
                    ...doc.description,
                    color: "#C8C2B8",
                },
                logo: {
                    ...doc.logo,
                    variant: "light",
                    url: "/lofty-logo-white.png",
                },
                layout: {
                    ...doc.layout,
                    borderColor: POST_TOKENS.colors.gold,
                },
            });
        default:
            return doc;
    }
}

export function mergePostDocument(
    base: PostDocument,
    patch: Partial<PostDocument>,
): PostDocument {
    return createDefaultPostDocument({
        ...base,
        ...patch,
        layout: { ...base.layout, ...(patch.layout ?? {}) },
        image: { ...base.image, ...(patch.image ?? {}) },
        overlay: { ...base.overlay, ...(patch.overlay ?? {}) },
        headline: { ...base.headline, ...(patch.headline ?? {}) },
        description: { ...base.description, ...(patch.description ?? {}) },
        button: { ...base.button, ...(patch.button ?? {}) },
        logo: { ...base.logo, ...(patch.logo ?? {}) },
        theme: { ...base.theme, ...(patch.theme ?? {}) },
        fonts: { ...base.fonts, ...(patch.fonts ?? {}) },
        amenitiesStyle: {
            ...base.amenitiesStyle,
            ...(patch.amenitiesStyle ?? {}),
        },
        contactStyle: {
            ...base.contactStyle,
            ...(patch.contactStyle ?? {}),
        },
        amenities: patch.amenities ?? base.amenities,
        contact: patch.contact ?? base.contact,
    });
}

/**
 * Old cream-card drafts share several defaults at once (opaque panel, pill CTA,
 * 4×2 amenity grid, #F7F3EC / #C4A574). A single matching value is a valid
 * editor choice and must not be rewritten.
 */
function isLegacyApprovedLayoutDraft(raw: Partial<PostDocument>): boolean {
    const overlay = raw.overlay;
    const theme = raw.theme;
    const button = raw.button;
    const amenitiesStyle = raw.amenitiesStyle;
    const layout = raw.layout;
    const headline = raw.headline;

    const signals = [
        theme?.background === "#F7F3EC" &&
            (theme?.gold === "#C4A574" || theme?.gold == null),
        overlay?.opacity != null &&
            overlay.opacity >= 0.85 &&
            (overlay.cardInsetX === 30 || overlay.cardInsetX === 18),
        button?.borderRadius === 999,
        amenitiesStyle?.columns === 4 && amenitiesStyle.goldLabels === true,
        layout?.outerPadding === 14 || layout?.outerPadding === 22,
        headline?.showAccentDivider === true &&
            (headline.accentWord ?? "").includes("Expectations"),
    ];

    return signals.filter(Boolean).length >= 3;
}

function applyLegacyApprovedLayout(
    doc: PostDocument,
    raw: Partial<PostDocument>,
): PostDocument {
    const defaults = createDefaultPostDocument();
    const visibleAmenityCount = doc.amenities.filter((a) => a.visible).length;

    let amenitiesStyle = doc.amenitiesStyle;
    if (visibleAmenityCount >= 7 && amenitiesStyle.columns === 4) {
        amenitiesStyle = { ...DEFAULT_AMENITIES_STYLE };
    }

    const overlay = { ...doc.overlay };
    if (
        raw.overlay?.cardInsetX === 30 ||
        raw.overlay?.cardInsetX === 18 ||
        raw.overlay?.cardInsetX === 26
    ) {
        overlay.cardInsetX = defaults.overlay.cardInsetX;
    }
    if (raw.overlay?.opacity != null && raw.overlay.opacity >= 0.85) {
        overlay.opacity = defaults.overlay.opacity;
        overlay.blur = defaults.overlay.blur;
        overlay.backgroundColor = defaults.overlay.backgroundColor;
        overlay.borderRadius = defaults.overlay.borderRadius;
        overlay.borderThickness = defaults.overlay.borderThickness;
        overlay.borderColor = defaults.overlay.borderColor;
        overlay.shadow = defaults.overlay.shadow;
    }
    if (
        raw.overlay?.photoHeightPercent != null &&
        (raw.overlay.photoHeightPercent >= 65 ||
            raw.overlay.photoHeightPercent === 58)
    ) {
        overlay.photoHeightPercent = defaults.overlay.photoHeightPercent;
        overlay.overlapPercent = defaults.overlay.overlapPercent;
    }

    const layout = { ...doc.layout };
    if (
        raw.layout?.outerPadding === 22 ||
        raw.layout?.outerPadding === 14 ||
        raw.layout?.outerPadding === 24
    ) {
        layout.outerPadding = defaults.layout.outerPadding;
        layout.borderRadius = defaults.layout.borderRadius;
        layout.borderThickness = defaults.layout.borderThickness;
        layout.borderColor = defaults.layout.borderColor;
    }
    if (
        raw.layout?.contentPaddingX === 30 ||
        raw.layout?.contentPaddingX === 46
    ) {
        layout.contentPaddingX = defaults.layout.contentPaddingX;
        layout.contentPaddingTop = defaults.layout.contentPaddingTop;
        layout.contentPaddingBottom = defaults.layout.contentPaddingBottom;
    }

    const theme = { ...doc.theme };
    if (
        raw.theme?.background === "#F7F3EC" &&
        (raw.theme?.gold === "#C4A574" || raw.theme?.gold == null)
    ) {
        theme.background = defaults.theme.background;
        theme.gold = defaults.theme.gold;
        theme.accent = defaults.theme.accent;
        theme.button = defaults.theme.button;
        theme.icon = defaults.theme.icon;
        theme.divider = defaults.theme.divider;
    }

    const button = { ...doc.button };
    if (raw.button?.borderRadius === 999) {
        button.borderRadius = defaults.button.borderRadius;
    }
    if (raw.button?.backgroundColor === "#C4A574") {
        button.backgroundColor = defaults.button.backgroundColor;
    }

    const headline = { ...doc.headline };
    if (
        raw.headline?.showAccentDivider === true &&
        (raw.headline?.accentWord ?? "").includes("Expectations")
    ) {
        headline.showAccentDivider = false;
    }
    if (raw.headline?.fontSize != null && raw.headline.fontSize <= 52) {
        headline.fontSize = defaults.headline.fontSize;
        headline.lineHeight = defaults.headline.lineHeight;
    }
    if (raw.headline?.accentColor === "#C4A574") {
        headline.accentColor = defaults.headline.accentColor;
    }

    let contactStyle = { ...doc.contactStyle };
    if (
        raw.contactStyle?.fontSize == null ||
        raw.contactStyle.fontSize <= 15 ||
        raw.contactStyle?.fontWeight === 600 ||
        raw.contactStyle?.iconSize == null ||
        raw.contactStyle.iconSize <= 22
    ) {
        contactStyle = {
            ...DEFAULT_CONTACT_STYLE,
            ...contactStyle,
            fontSize: DEFAULT_CONTACT_STYLE.fontSize,
            fontWeight: DEFAULT_CONTACT_STYLE.fontWeight,
            iconSize: DEFAULT_CONTACT_STYLE.iconSize,
            strokeWidth: DEFAULT_CONTACT_STYLE.strokeWidth,
            gap: DEFAULT_CONTACT_STYLE.gap,
            paddingY: DEFAULT_CONTACT_STYLE.paddingY,
        };
    }
    if (
        contactStyle.iconColor === POST_TOKENS.colors.gold &&
        contactStyle.textColor === POST_TOKENS.colors.gold
    ) {
        contactStyle = {
            ...contactStyle,
            textColor: DEFAULT_CONTACT_STYLE.textColor,
        };
    }

    return {
        ...doc,
        amenitiesStyle,
        overlay,
        layout,
        theme,
        button,
        headline,
        contactStyle,
    };
}

/** One-time upgrade for unedited early cream-card drafts. Not used on editor merges. */
export function migrateLegacyPostDocument(
    raw: Partial<PostDocument>,
): PostDocument {
    const doc = createDefaultPostDocument(raw);
    if (!isLegacyApprovedLayoutDraft(raw)) return doc;
    return applyLegacyApprovedLayout(doc, raw);
}
