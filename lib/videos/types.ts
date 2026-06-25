export type HeroVideoVariantName = "mobile" | "desktop" | "poster";

export type ProcessedHeroVideoVariant = {
    name: HeroVideoVariantName;
    buffer: Buffer;
    contentType: string;
    bytes: number;
};

export type ProcessedHeroVideoResult = {
    variants: ProcessedHeroVideoVariant[];
};

export type HeroVideoUrls = {
    mobileMp4Url: string;
    desktopMp4Url: string;
    posterUrl: string;
};

export type HeroVideoConfig = {
    id: string;
    mobileMp4Url: string;
    desktopMp4Url: string;
    posterUrl: string;
    updatedAt: string;
};

export type ApartmentVideoConfig = {
    id: string;
    apartmentId: string;
    mobileMp4Url: string;
    desktopMp4Url: string;
    posterUrl: string;
    updatedAt: string;
};

export type ApartmentVideoSummary = {
    apartmentId: string;
    posterUrl: string;
};
