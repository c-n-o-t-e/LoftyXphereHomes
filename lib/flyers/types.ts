export type FlyerTemplateKey =
    | "luxury-minimal"
    | "modern-premium"
    | "hotel-style"
    | "magazine-style"
    | "corporate-executive";

export type FlyerPageSize =
    | "a5-portrait"
    | "a4-portrait"
    | "a4-landscape"
    | "us-letter";

export type FlyerSide = "front" | "back";

export type FlyerImageSlotKey =
    | "hero"
    | "livingRoom"
    | "bedroom"
    | "kitchen"
    | "bathroom"
    | "pool"
    | "gym"
    | "exterior";

export type FlyerLogoPosition =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

export type FlyerQrDestinationType =
    | "website"
    | "booking"
    | "whatsapp"
    | "apartment";

export type FlyerExportFormat = "pdf" | "png" | "jpeg";

export type FlyerImageSlot = {
    url: string | null;
    alt?: string;
    label?: string;
};

export type FlyerContact = {
    website: string;
    phone: string;
    whatsapp: string;
    instagram: string;
};

export type FlyerTheme = {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
};

export type FlyerLogo = {
    url: string | null;
    position: FlyerLogoPosition;
    sizePercent: number;
};

export type FlyerQrConfig = {
    destinationType: FlyerQrDestinationType;
    customUrl?: string;
};

export type FlyerPayload = {
    apartmentId: string | null;
    apartmentName: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    bodyCopy: string;
    location: string;
    contact: FlyerContact;
    qr: FlyerQrConfig;
    amenities: string[];
    perfectFor: string[];
    theme: FlyerTheme;
    logo: FlyerLogo;
    images: Record<FlyerImageSlotKey, FlyerImageSlot>;
    gridImageOrder: FlyerImageSlotKey[];
};

export type FlyerRecord = {
    id: string;
    title: string;
    templateKey: FlyerTemplateKey;
    pageSize: FlyerPageSize;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    payload: FlyerPayload;
    createdByEmail: string | null;
    createdAt: string;
    updatedAt: string;
};
