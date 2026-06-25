import { APARTMENT_IMAGES_BUCKET } from "@/lib/images/constants";

export const HERO_VIDEO_BUCKET = APARTMENT_IMAGES_BUCKET;

export const HERO_VIDEO_MAX_BYTES =
    (Number.parseInt(process.env.HERO_VIDEO_MAX_MB ?? "80", 10) || 80) *
    1024 *
    1024;

export const HERO_VIDEO_MAX_DURATION_SEC =
    Number.parseInt(process.env.HERO_VIDEO_MAX_SECONDS ?? "60", 10) || 60;

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

export const APARTMENT_VIDEO_MAX_BYTES =
    (Number.parseInt(process.env.APARTMENT_VIDEO_MAX_MB ?? "50", 10) || 50) *
    1024 *
    1024;

export const APARTMENT_VIDEO_MAX_DURATION_SEC =
    Number.parseInt(process.env.APARTMENT_VIDEO_MAX_SECONDS ?? "100", 10) || 100;

export const APARTMENT_VIDEO_STORAGE_PREFIX = "apartments";

/** Max source file size accepted by the temporary compress tool (local admin only). */
export const VIDEO_COMPRESS_TOOL_MAX_INPUT_BYTES =
    (Number.parseInt(process.env.VIDEO_COMPRESS_TOOL_MAX_INPUT_MB ?? "300", 10) ||
        300) *
    1024 *
    1024;

/** Target output size for the compress tool — slightly under the upload cap for headroom. */
export const VIDEO_COMPRESS_TOOL_TARGET_BYTES = Math.floor(
    HERO_VIDEO_MAX_BYTES * 0.92,
);

/** Max clip length accepted by the temporary compress tool (default: 100s). */
export const VIDEO_COMPRESS_TOOL_MAX_DURATION_SEC =
    Number.parseInt(process.env.VIDEO_COMPRESS_TOOL_MAX_DURATION_SEC ?? "100", 10) ||
    100;

export const APARTMENT_VIDEO_VARIANTS = {
    mobile: {
        fileName: "mobile.mp4",
        maxWidth: 1280,
        crf: 28,
        maxRateKbps: 1000,
        maxBytes: 6 * 1024 * 1024,
    },
    desktop: {
        fileName: "desktop.mp4",
        maxWidth: 1920,
        crf: 24,
        maxRateKbps: 2000,
        maxBytes: 12 * 1024 * 1024,
    },
    poster: {
        fileName: "poster.webp",
        width: 1920,
        quality: 72,
        maxBytes: 200 * 1024,
    },
} as const;
