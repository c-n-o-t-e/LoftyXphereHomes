import { APARTMENT_IMAGES_BUCKET } from "@/lib/images/constants";

export const HERO_VIDEO_BUCKET = APARTMENT_IMAGES_BUCKET;

export const HERO_VIDEO_MAX_BYTES =
    (Number.parseInt(process.env.HERO_VIDEO_MAX_MB ?? "80", 10) || 80) *
    1024 *
    1024;

export const HERO_VIDEO_MAX_DURATION_SEC = 60;

export const ALLOWED_HERO_VIDEO_MIME_TYPES = new Set([
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "application/octet-stream",
]);

export const HERO_VIDEO_VARIANTS = {
    mobile: {
        fileName: "mobile.mp4",
        maxWidth: 1280,
        crf: 28,
        maxRateKbps: 1200,
        maxBytes: 4 * 1024 * 1024,
    },
    desktop: {
        fileName: "desktop.mp4",
        maxWidth: 1920,
        crf: 23,
        maxRateKbps: 2500,
        maxBytes: 8 * 1024 * 1024,
    },
    poster: {
        fileName: "poster.webp",
        width: 1920,
        quality: 72,
        maxBytes: 200 * 1024,
    },
} as const;

export const HERO_STORAGE_PREFIX = "site/hero";
