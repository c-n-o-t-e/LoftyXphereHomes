import type { FlyerTemplateKey } from "@/lib/flyers/types";

export type FlyerTemplateDefinition = {
    key: FlyerTemplateKey;
    label: string;
    description: string;
    displayFont: string;
    bodyFont: string;
    heroOverlay: "gradient-dark" | "gradient-navy" | "solid-scrim" | "minimal" | "none";
    frontLayout: "hero-dominant" | "split" | "editorial" | "corporate";
    backLayout: "grid-amenities" | "magazine-grid" | "hotel-columns";
    accentStyle: "gold-line" | "gold-border" | "emerald-dot" | "navy-band";
};

export const FLYER_TEMPLATES: Record<FlyerTemplateKey, FlyerTemplateDefinition> = {
    "luxury-minimal": {
        key: "luxury-minimal",
        label: "Luxury Minimal",
        description: "Large hero, white space, gold accents — Marriott-inspired.",
        displayFont: "var(--font-playfair), 'Playfair Display', Georgia, serif",
        bodyFont: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
        heroOverlay: "none",
        frontLayout: "hero-dominant",
        backLayout: "grid-amenities",
        accentStyle: "gold-line",
    },
    "modern-premium": {
        key: "modern-premium",
        label: "Modern Premium",
        description: "Bold typography, split layout, contemporary hospitality feel.",
        displayFont: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
        bodyFont: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
        heroOverlay: "solid-scrim",
        frontLayout: "split",
        backLayout: "grid-amenities",
        accentStyle: "gold-border",
    },
    "hotel-style": {
        key: "hotel-style",
        label: "Hotel Style",
        description: "Classic hospitality grid with navy and gold accents.",
        displayFont: "var(--font-playfair), 'Playfair Display', Georgia, serif",
        bodyFont: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
        heroOverlay: "gradient-navy",
        frontLayout: "hero-dominant",
        backLayout: "hotel-columns",
        accentStyle: "navy-band",
    },
    "magazine-style": {
        key: "magazine-style",
        label: "Magazine Style",
        description: "Editorial layout with serif headlines and asymmetric grid.",
        displayFont: "var(--font-playfair), 'Playfair Display', Georgia, serif",
        bodyFont: "var(--font-poppins), 'Poppins', system-ui, sans-serif",
        heroOverlay: "minimal",
        frontLayout: "editorial",
        backLayout: "magazine-grid",
        accentStyle: "emerald-dot",
    },
    "corporate-executive": {
        key: "corporate-executive",
        label: "Corporate Executive",
        description: "Clean, structured layout for business lounges and offices.",
        displayFont: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
        bodyFont: "var(--font-montserrat), 'Montserrat', system-ui, sans-serif",
        heroOverlay: "gradient-dark",
        frontLayout: "corporate",
        backLayout: "hotel-columns",
        accentStyle: "gold-line",
    },
};

export function getFlyerTemplate(key: FlyerTemplateKey) {
    return FLYER_TEMPLATES[key];
}
