import {
    INVOICE_WEBSITE_DISPLAY,
    SITE_URL,
    getWhatsAppChatUrl,
} from "@/lib/constants";
import type {
    FlyerImageSlotKey,
    FlyerPageSize,
    FlyerTemplateKey,
} from "@/lib/flyers/types";
import {
    SUITE_AMENITY_CATALOG,
    type SuiteAmenityOption,
} from "@/lib/amenities/suiteAmenities";

export type FlyerAmenityOption = SuiteAmenityOption;

export const FLYER_AMENITY_OPTIONS: FlyerAmenityOption[] = SUITE_AMENITY_CATALOG;

export const FLYER_IMAGE_SLOT_DEFINITIONS: {
    key: FlyerImageSlotKey;
    label: string;
    group: "hero" | "grid";
}[] = [
    { key: "hero", label: "Hero Image", group: "hero" },
    { key: "livingRoom", label: "Living Room", group: "grid" },
    { key: "bedroom", label: "Bedroom", group: "grid" },
    { key: "kitchen", label: "Kitchen", group: "grid" },
    { key: "bathroom", label: "Bathroom", group: "grid" },
    { key: "pool", label: "Swimming Pool", group: "grid" },
    { key: "gym", label: "Gym", group: "grid" },
    { key: "exterior", label: "Exterior", group: "grid" },
];

/** Number of photos shown in the back-page image grid (2 columns × 3 rows). */
export const FLYER_BACK_GRID_IMAGE_COUNT = 6;

export const FLYER_GRID_IMAGE_SLOT_KEYS: FlyerImageSlotKey[] = [
    "livingRoom",
    "bedroom",
    "kitchen",
    "bathroom",
    "pool",
    "gym",
    "exterior",
];

export const FLYER_PERFECT_FOR_OPTIONS: string[] = [
    "Business Travellers",
    "Families",
    "Vacation",
    "Weekend Getaways",
    "Corporate Stays",
    "Couples",
    "Events",
];

export const FLYER_TEMPLATE_OPTIONS: {
    key: FlyerTemplateKey;
    label: string;
    description: string;
}[] = [
    {
        key: "luxury-minimal",
        label: "Luxury Minimal",
        description: "Large hero, white space, gold accents — Marriott-inspired.",
    },
    {
        key: "modern-premium",
        label: "Modern Premium",
        description: "Bold typography, split layout, contemporary hospitality feel.",
    },
    {
        key: "hotel-style",
        label: "Hotel Style",
        description: "Classic hospitality grid with navy and gold accents.",
    },
    {
        key: "magazine-style",
        label: "Magazine Style",
        description: "Editorial layout with serif headlines and asymmetric grid.",
    },
    {
        key: "corporate-executive",
        label: "Corporate Executive",
        description: "Clean, structured layout for business lounges and offices.",
    },
];

export const FLYER_PAGE_SIZE_OPTIONS: { key: FlyerPageSize; label: string }[] = [
    { key: "a5-portrait", label: "A5 Portrait (148 × 210 mm)" },
    { key: "a4-portrait", label: "A4 Portrait (210 × 297 mm)" },
    { key: "a4-landscape", label: "A4 Landscape (297 × 210 mm)" },
    { key: "us-letter", label: "US Letter (8.5 × 11 in)" },
];

export const DEFAULT_FLYER_DISCOVERY_LINE =
    "Discover more luxury apartments at our website";

export const DEFAULT_FLYER_CONTACT = {
    website: INVOICE_WEBSITE_DISPLAY,
    phone: process.env.BUSINESS_PHONE || process.env.CONTACT_PHONE || "08161122328",
    whatsapp: process.env.BUSINESS_PHONE || process.env.CONTACT_PHONE || "08161122328",
    instagram: "@loftyxpherehomes",
};

export const DEFAULT_FLYER_THEME = {
    primaryColor: "#FFFFFF",
    accentColor: "#C9A962",
    backgroundColor: "#FFFFFF",
    textColor: "#111111",
};

export const DEFAULT_FLYER_LOGO = {
    url: "/lofty-logo-white.png",
    position: "top-right" as const,
    sizePercent: 16,
};

export function getDefaultGridImageOrder(): FlyerImageSlotKey[] {
    return ["livingRoom", "bedroom", "kitchen", "bathroom", "pool", "gym"];
}

export function createEmptyFlyerImages(): Record<
    FlyerImageSlotKey,
    { url: string | null; alt?: string; label?: string }
> {
    return Object.fromEntries(
        FLYER_IMAGE_SLOT_DEFINITIONS.map((slot) => [
            slot.key,
            { url: null, alt: slot.label, label: slot.label },
        ]),
    ) as Record<FlyerImageSlotKey, { url: string | null; alt?: string; label?: string }>;
}

export function resolveDefaultWebsiteUrl(): string {
    const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || SITE_URL;
    try {
        const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
        return url.origin;
    } catch {
        return `https://${INVOICE_WEBSITE_DISPLAY}`;
    }
}

export function resolveDefaultWhatsAppUrl(): string {
    return (
        getWhatsAppChatUrl(DEFAULT_FLYER_CONTACT.whatsapp) ??
        `https://wa.me/2348161122328`
    );
}
