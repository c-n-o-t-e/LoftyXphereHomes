export type ProcessedImageVariant = {
    buffer: Buffer;
    width: number;
    height: number;
    bytes: number;
};

export type ProcessedApartmentImage = {
    thumbnail: ProcessedImageVariant;
    medium: ProcessedImageVariant;
    large: ProcessedImageVariant;
    blurDataUrl: string;
    contentType: "image/webp";
};

export type ApartmentImageUrls = {
    id: string;
    apartmentId: string;
    originalUrl: string;
    thumbnailUrl: string;
    mediumUrl: string;
    largeUrl: string;
    blurDataUrl?: string | null;
    altText?: string | null;
    displayOrder: number;
};

export type ApartmentImageSet = {
    thumbnail: string;
    medium: string;
    large: string;
    blurDataUrl?: string | null;
    altText?: string | null;
};
