export const APARTMENT_IMAGES_BUCKET =
    process.env.APARTMENT_IMAGES_BUCKET?.trim() || "ApartmentImages";

export const APARTMENT_IMAGE_MAX_BYTES =
    (Number.parseInt(process.env.APARTMENT_IMAGE_MAX_MB ?? "10", 10) || 10) *
    1024 *
    1024;

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
]);

export const IMAGE_VARIANTS = {
    thumbnail: { width: 300, minBytes: 30 * 1024, maxBytes: 50 * 1024 },
    medium: { width: 800, minBytes: 100 * 1024, maxBytes: 150 * 1024 },
    large: { width: 1600, minBytes: 200 * 1024, maxBytes: 350 * 1024 },
} as const;

export type ImageVariantName = keyof typeof IMAGE_VARIANTS;
