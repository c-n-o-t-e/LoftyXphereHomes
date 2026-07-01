import { APARTMENT_IMAGES_BUCKET } from "@/lib/images/constants";

export const HERO_VIDEO_BUCKET = APARTMENT_IMAGES_BUCKET;

export const HERO_VIDEO_MAX_BYTES =
    (Number.parseInt(process.env.HERO_VIDEO_MAX_MB ?? "80", 10) || 80) *
    1024 *
    1024;

export const HERO_VIDEO_MAX_DURATION_SEC =
    Number.parseInt(process.env.HERO_VIDEO_MAX_SECONDS ?? "12", 10) || 12;

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

/** Hard ceiling for temp tool output — must stay under the Supabase upload cap. */
export const VIDEO_COMPRESS_TOOL_UPLOAD_CAP_BYTES = Math.floor(
    HERO_VIDEO_MAX_BYTES * 0.92,
);

const MB = 1024 * 1024;

/** Pick a web-ready target size based on clip length (not the full upload cap). */
export function resolveCompressToolTargetBytes(args: {
    durationSec: number;
    hasAudio: boolean;
}) {
    const envMb = Number.parseInt(
        process.env.VIDEO_COMPRESS_TOOL_TARGET_MB ?? "",
        10,
    );
    if (Number.isFinite(envMb) && envMb > 0) {
        return Math.min(envMb * MB, VIDEO_COMPRESS_TOOL_UPLOAD_CAP_BYTES);
    }

    const durationSec = Math.max(1, args.durationSec);

    // Hero-style loops — match HERO_VIDEO_VARIANTS desktop budget (~3–4 MB).
    if (durationSec <= 15) {
        return Math.min(VIDEO_COMPRESS_TOOL_UPLOAD_CAP_BYTES, 4 * MB);
    }

    // Short tours.
    if (durationSec <= 45) {
        return Math.min(VIDEO_COMPRESS_TOOL_UPLOAD_CAP_BYTES, 6 * MB);
    }

    // Long apartment tours — scale with length, cap before admin splits mobile/desktop.
    const audioHeadroomMb = args.hasAudio ? 1.6 : 0;
    const videoMb = (durationSec / 60) * 4.5;
    const targetMb = Math.ceil(videoMb + audioHeadroomMb);
    const clampedMb = Math.min(12, Math.max(6, targetMb));

    return Math.min(VIDEO_COMPRESS_TOOL_UPLOAD_CAP_BYTES, clampedMb * MB);
}

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
