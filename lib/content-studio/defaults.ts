import { autoLogoVariant, resolveTheme } from "@/lib/content-studio/brand-theme";
import { getLayout } from "@/lib/content-studio/layouts";
import type {
    ContentCategory,
    EditorialDocument,
    LayoutId,
    StudioAssetTransform,
    StudioContentPoint,
    ThemeId,
} from "@/lib/content-studio/types";
import { STUDIO_DOCUMENT_VERSION } from "@/lib/content-studio/types";

export const CATEGORY_LABELS: Record<ContentCategory, string> = {
    educational: "Educational",
    "travel-tips": "Travel Tips",
    "abuja-guide": "Abuja Guide",
    "guest-tips": "Guest Tips",
    hospitality: "Hospitality",
    lifestyle: "Lifestyle",
    inspirational: "Inspirational",
    "new-week": "New Week",
    "new-month": "New Month",
    holiday: "Holiday",
    announcement: "Announcement",
    promotion: "Promotion",
    "local-discovery": "Local Discovery",
    wellness: "Wellness",
    "business-travel": "Business Travel",
};

export const DEFAULT_POINTS: StudioContentPoint[] = [
    {
        id: "p1",
        number: "01",
        heading: "Location",
        body: "Choose a neighbourhood that matches how you actually want to spend the stay.",
        icon: "map-pin",
    },
    {
        id: "p2",
        number: "02",
        heading: "Privacy",
        body: "A well-run shortlet feels discreet — arrivals, access, and quiet hours included.",
        icon: "shield",
    },
    {
        id: "p3",
        number: "03",
        heading: "Power",
        body: "Reliable electricity is not a luxury in Abuja. Confirm backup before you book.",
        icon: "zap",
    },
    {
        id: "p4",
        number: "04",
        heading: "Internet",
        body: "Ask for the real speed, not the brochure promise — especially for work stays.",
        icon: "wifi",
    },
    {
        id: "p5",
        number: "05",
        heading: "Cleanliness",
        body: "Housekeeping standards should be visible in every photograph and review.",
        icon: "sparkles",
    },
];

function normalizeAsset(
    asset: Partial<StudioAssetTransform> | undefined,
): StudioAssetTransform {
    const shadow = asset?.shadow ?? 32;
    const defaults: StudioAssetTransform = {
        url: null,
        concept: "",
        category: "hospitality",
        x: 540,
        y: 675,
        width: 400,
        height: 400,
        rotation: 0,
        scale: 1,
        opacity: 1,
        shadow,
        shadowOpacity: 0.18,
        shadowBlur: shadow,
        shadowScale: 0.7,
        shadowOffsetY: Math.round(shadow * 0.4),
    };
    return { ...defaults, ...asset };
}

const CATEGORY_STARTERS: Record<
    ContentCategory,
    Pick<EditorialDocument["content"], "kicker" | "title" | "subtitle" | "body" | "cta">
> = {
    educational: {
        kicker: "Guest Education",
        title: "Five things to know before booking a shortlet",
        subtitle: "A quieter way to choose well.",
        body: "The right stay is decided before you arrive — in the details most listings leave out.",
        cta: "Discover more",
    },
    "travel-tips": {
        kicker: "Travel Notes",
        title: "What to pack for your Abuja stay",
        subtitle: "Travel lighter. Arrive better.",
        body: "A considered bag is the difference between a rushed arrival and an easy first evening.",
        cta: "Enquire to stay",
    },
    "abuja-guide": {
        kicker: "Abuja Guide",
        title: "Five places to visit near Wuye",
        subtitle: "A local edit.",
        body: "Stay close to the city you came for — without spending the day in traffic.",
        cta: "Discover more",
    },
    "guest-tips": {
        kicker: "For Our Guests",
        title: "How to settle in on your first evening",
        subtitle: "A calm arrival.",
        body: "The first hour sets the tone. Arrive, unpack slowly, and let the apartment do the rest.",
        cta: "Book a stay",
    },
    hospitality: {
        kicker: "Hospitality",
        title: "A great stay is more than a room",
        subtitle: "It is an experience.",
        body: "Hospitality is the quiet work of anticipating what a guest needs before they ask.",
        cta: "Visit loftyxpherehomes.com",
    },
    lifestyle: {
        kicker: "Lifestyle",
        title: "Mornings that feel unhurried",
        subtitle: "A slower luxury.",
        body: "Good linen, good coffee, and a room that does not ask anything of you.",
        cta: "Discover more",
    },
    inspirational: {
        kicker: "A Note",
        title: "A great stay is more than a room. It is an experience.",
        subtitle: "",
        body: "LoftyXphereHomes",
        cta: "",
    },
    "new-week": {
        kicker: "A New Week",
        title: "Happy new week",
        subtitle: "Begin again, quietly.",
        body: "May this week feel spacious — in your calendar, and in the rooms you choose.",
        cta: "",
    },
    "new-month": {
        kicker: "A New Month",
        title: "Welcome the month",
        subtitle: "A fresh page.",
        body: "New month. Same standard. Rooms prepared with care.",
        cta: "",
    },
    holiday: {
        kicker: "Seasonal",
        title: "A warmer way to spend the holiday",
        subtitle: "Stay close. Stay well.",
        body: "The holiday is better when the room already feels like a home.",
        cta: "Enquire to stay",
    },
    announcement: {
        kicker: "Announcement",
        title: "Now taking stays in Wuye",
        subtitle: "A considered address.",
        body: "Serviced apartments prepared for guests who prefer quiet luxury to noise.",
        cta: "Book a stay",
    },
    promotion: {
        kicker: "Invitation",
        title: "A longer stay, a quieter rate",
        subtitle: "For those who linger.",
        body: "Ask about extended stays — the house prefers guests who settle in.",
        cta: "Enquire to stay",
    },
    "local-discovery": {
        kicker: "Local Discovery",
        title: "Where to eat after a Wuye afternoon",
        subtitle: "A short list.",
        body: "Close enough to walk. Considered enough to remember.",
        cta: "Discover more",
    },
    wellness: {
        kicker: "Wellness",
        title: "How to rest properly on the road",
        subtitle: "Travel without depletion.",
        body: "Sleep, water, and a room that does not compete with your nervous system.",
        cta: "Discover more",
    },
    "business-travel": {
        kicker: "Business Travel",
        title: "What a work stay should quietly include",
        subtitle: "Arrive ready.",
        body: "Desk, power, internet, and a door that closes on the day.",
        cta: "Book a stay",
    },
};

export function createDefaultEditorialDocument(
    patch?: Partial<EditorialDocument> & {
        category?: ContentCategory;
        layoutId?: LayoutId;
        themeId?: ThemeId;
    },
): EditorialDocument {
    const category = patch?.category ?? "educational";
    const layoutId = patch?.layoutId ?? "magazine-editorial";
    const layout = getLayout(layoutId);
    const themeId = patch?.themeId ?? layout.theme;
    const theme = resolveTheme(themeId);
    const starter = CATEGORY_STARTERS[category];

    const base: EditorialDocument = {
        version: STUDIO_DOCUMENT_VERSION,
        format: "portrait-4-5",
        category,
        layoutId,
        themeId,
        theme,
        fonts: {
            heading: "Playfair Display",
            body: "Inter",
        },
        typography: { ...layout.typography },
        content: {
            ...starter,
            ctaScript: "",
            ctaButton: "",
            seriesNumber: "",
            points: DEFAULT_POINTS.map((point) => ({ ...point })),
            keywords: [],
        },
        asset: normalizeAsset({
            url: null,
            concept: "",
            category: "hospitality",
            ...layout.defaultAsset,
        }),
        logo: {
            variant: autoLogoVariant(theme),
            opacity: 0.88,
            size: 58,
            wordmark: "LOFTYXPHEREHOMES",
            showWordmark: false,
        },
        footer: {
            variant: layout.footer,
            instagram: "@loftyxpherehomes",
            whatsapp: "0816 112 2328",
            website: "loftyxpherehomes.com",
        },
    };

    return mergeEditorialDocument(base, patch ?? {});
}

export function mergeEditorialDocument(
    current: EditorialDocument,
    patch: Partial<EditorialDocument>,
): EditorialDocument {
    return {
        ...current,
        ...patch,
        theme: { ...current.theme, ...patch.theme },
        fonts: { ...current.fonts, ...patch.fonts },
        typography: { ...current.typography, ...patch.typography },
        content: {
            ...current.content,
            ...patch.content,
            points: patch.content?.points ?? current.content.points,
            keywords: patch.content?.keywords ?? current.content.keywords,
        },
        asset: normalizeAsset({ ...current.asset, ...patch.asset }),
        logo: { ...current.logo, ...patch.logo },
        footer: { ...current.footer, ...patch.footer },
    };
}

export function applyLayoutToDocument(
    document: EditorialDocument,
    layoutId: LayoutId,
    options?: { keepAssetUrl?: boolean; keepTheme?: boolean },
): EditorialDocument {
    const layout = getLayout(layoutId);
    const themeId = options?.keepTheme ? document.themeId : layout.theme;
    const theme = resolveTheme(themeId);

    return mergeEditorialDocument(document, {
        layoutId,
        themeId,
        theme,
        typography: { ...layout.typography },
        footer: { ...document.footer, variant: layout.footer },
        logo: {
            ...document.logo,
            variant: autoLogoVariant(theme),
        },
        asset: {
            ...document.asset,
            url: options?.keepAssetUrl ? document.asset.url : document.asset.url,
            ...layout.defaultAsset,
        },
    });
}
