export const APARTMENT_IMAGES_BUCKET =
    process.env.APARTMENT_IMAGES_BUCKET?.trim() || "ApartmentImages";

export const APARTMENT_IMAGE_MAX_BYTES =
    (Number.parseInt(process.env.APARTMENT_IMAGE_MAX_MB ?? "10", 10) || 10) *
    1024 *
    1024;

/** Supabase plan cap per object (Free tier: 50 MB). Bucket limit cannot exceed this. */
export const SUPABASE_STORAGE_MAX_FILE_BYTES =
    (Number.parseInt(process.env.SUPABASE_STORAGE_MAX_FILE_MB ?? "50", 10) || 50) *
    1024 *
    1024;

export function resolveBucketFileSizeLimitBytes(args: {
    apartmentImageMaxBytes: number;
    heroVideoMaxBytes: number;
    apartmentVideoMaxBytes: number;
    supabasePlanMaxBytes: number;
}) {
    const desired = Math.max(
        args.apartmentImageMaxBytes,
        args.heroVideoMaxBytes,
        args.apartmentVideoMaxBytes,
    );
    return Math.min(desired, args.supabasePlanMaxBytes);
}

export const ALLOWED_IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
]);

/** MIME types allowed on the Supabase Storage bucket (raw uploads + processed variants). */
export const APARTMENT_STORAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
    "application/octet-stream",
    "video/mp4",
    "video/webm",
    "video/quicktime",
] as const;

export const IMAGE_VARIANTS = {
    thumbnail: { width: 300, minBytes: 30 * 1024, maxBytes: 50 * 1024 },
    medium: { width: 800, minBytes: 100 * 1024, maxBytes: 150 * 1024 },
    large: { width: 1600, minBytes: 200 * 1024, maxBytes: 350 * 1024 },
} as const;

export type ImageVariantName = keyof typeof IMAGE_VARIANTS;
