import sharp from "sharp";
import {
    ALLOWED_IMAGE_MIME_TYPES,
    APARTMENT_IMAGE_MAX_BYTES,
    IMAGE_VARIANTS,
    type ImageVariantName,
} from "./constants";
import type { ProcessedApartmentImage, ProcessedImageVariant } from "./types";

export type ValidateImageInputResult =
    | { ok: true; mimeType: string }
    | { ok: false; error: string };

export function validateImageInput(args: {
    buffer: Buffer;
    mimeType: string;
    fileName?: string;
}): ValidateImageInputResult {
    const mimeType = args.mimeType.toLowerCase().split(";")[0]?.trim() ?? "";

    if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
        return {
            ok: false,
            error: "Unsupported file type. Upload JPEG, PNG, WebP, or HEIC.",
        };
    }

    if (args.buffer.length > APARTMENT_IMAGE_MAX_BYTES) {
        return {
            ok: false,
            error: `File exceeds maximum size of ${Math.round(APARTMENT_IMAGE_MAX_BYTES / (1024 * 1024))}MB.`,
        };
    }

    if (args.buffer.length === 0) {
        return { ok: false, error: "File is empty." };
    }

    return { ok: true, mimeType };
}

async function encodeWebpVariant(
    input: Buffer,
    variant: ImageVariantName,
): Promise<ProcessedImageVariant> {
    const { width, minBytes, maxBytes } = IMAGE_VARIANTS[variant];
    let quality = 82;

    for (let attempt = 0; attempt < 8; attempt += 1) {
        const result = await sharp(input)
            .rotate()
            .resize({ width, withoutEnlargement: true })
            .webp({ quality, effort: 4 })
            .toBuffer({ resolveWithObject: true });

        const bytes = result.data.length;
        if (bytes <= maxBytes) {
            return {
                buffer: result.data,
                width: result.info.width,
                height: result.info.height,
                bytes,
            };
        }

        quality = Math.max(40, quality - 8);
    }

    const fallback = await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 40, effort: 4 })
        .toBuffer({ resolveWithObject: true });

    return {
        buffer: fallback.data,
        width: fallback.info.width,
        height: fallback.info.height,
        bytes: fallback.data.length,
    };
}

async function createBlurPlaceholder(input: Buffer): Promise<string> {
    const blurBuffer = await sharp(input)
        .rotate()
        .resize({ width: 20, withoutEnlargement: true })
        .webp({ quality: 20 })
        .toBuffer();

    return `data:image/webp;base64,${blurBuffer.toString("base64")}`;
}

export async function processApartmentImage(
    input: Buffer,
): Promise<ProcessedApartmentImage> {
    const normalized = await sharp(input).rotate().toBuffer();
    const originalWebp = await sharp(normalized)
        .webp({ quality: 90, effort: 4 })
        .toBuffer({ resolveWithObject: true });

    const [thumbnail, medium, large, blurDataUrl] = await Promise.all([
        encodeWebpVariant(normalized, "thumbnail"),
        encodeWebpVariant(normalized, "medium"),
        encodeWebpVariant(normalized, "large"),
        createBlurPlaceholder(normalized),
    ]);

    return {
        original: {
            buffer: originalWebp.data,
            width: originalWebp.info.width,
            height: originalWebp.info.height,
            bytes: originalWebp.data.length,
        },
        thumbnail,
        medium,
        large,
        blurDataUrl,
        contentType: "image/webp",
    };
}
