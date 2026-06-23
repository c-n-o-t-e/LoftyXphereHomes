import sharp from "sharp";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
    APARTMENT_IMAGES_BUCKET,
} from "./constants";
import { ensureApartmentImagesBucket } from "./bucket";

export { ensureApartmentImagesBucket };

export function buildStorageKeyBase(apartmentId: string, imageId: string) {
    return `apartments/${apartmentId}/${imageId}`;
}

export function buildRawUploadKey(apartmentId: string, imageId: string) {
    return `${buildStorageKeyBase(apartmentId, imageId)}/raw-upload`;
}

export function buildPublicStorageUrl(storageKey: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    if (!supabaseUrl) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    }
    return `${supabaseUrl}/storage/v1/object/public/${APARTMENT_IMAGES_BUCKET}/${storageKey}`;
}

function requireSupabaseUploadEnv() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        throw new Error("Missing Supabase storage credentials");
    }
    return { supabaseUrl, serviceKey };
}

/**
 * Copy image bytes into a standalone Uint8Array for fetch/upload.
 * Never pass Buffer.buffer.slice() directly — in production Sharp often backs
 * buffers with SharedArrayBuffer, and fetch stores String(sab) which is the
 * 26-byte literal "[object SharedArrayBuffer]" (what you saw in Storage).
 */
function toBinaryBody(buffer: Buffer): ArrayBuffer {
    const copy = new ArrayBuffer(buffer.length);
    new Uint8Array(copy).set(buffer);
    return copy;
}

async function assertValidImageBuffer(buffer: Buffer, label: string) {
    try {
        await sharp(buffer).metadata();
    } catch {
        throw new Error(
            `Image processing produced an invalid ${label}. Please retry the upload.`,
        );
    }
}

/**
 * Upload via Supabase REST with a raw Uint8Array body.
 * Avoids subtle Buffer/string corruption that can happen in bundled server runtimes.
 */
async function uploadBinaryObject(
    storageKey: string,
    buffer: Buffer,
    contentType: string,
) {
    await assertValidImageBuffer(buffer, storageKey);

    const { supabaseUrl, serviceKey } = requireSupabaseUploadEnv();
    const response = await fetch(
        `${supabaseUrl}/storage/v1/object/${APARTMENT_IMAGES_BUCKET}/${storageKey}`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${serviceKey}`,
                "Content-Type": contentType,
                "x-upsert": "true",
                "cache-control": "public, max-age=31536000, immutable",
            },
            body: toBinaryBody(buffer),
        },
    );

    if (!response.ok) {
        const text = await response.text();
        throw new Error(
            `Failed to upload ${storageKey}: ${text || response.statusText}`,
        );
    }

    const stored = await downloadStorageObject(storageKey);
    if (stored.length !== buffer.length) {
        await supabaseStorageRemove(storageKey);
        throw new Error(
            `Upload verification failed for ${storageKey}: expected ${buffer.length} bytes, got ${stored.length}.`,
        );
    }
    try {
        await sharp(stored).metadata();
    } catch {
        await supabaseStorageRemove(storageKey);
        throw new Error(
            `Upload verification failed for ${storageKey}: stored file is not a valid image.`,
        );
    }
}

async function supabaseStorageRemove(storageKey: string) {
    const supabase = createServerSupabaseClient();
    await supabase.storage.from(APARTMENT_IMAGES_BUCKET).remove([storageKey]);
}

export async function uploadImageVariants(args: {
    apartmentId: string;
    imageId: string;
    variants: {
        thumbnail: Buffer;
        medium: Buffer;
        large: Buffer;
    };
}) {
    await ensureApartmentImagesBucket();
    const storageKeyBase = buildStorageKeyBase(args.apartmentId, args.imageId);

    const uploads = [
        { key: `${storageKeyBase}/thumbnail.webp`, buffer: args.variants.thumbnail },
        { key: `${storageKeyBase}/medium.webp`, buffer: args.variants.medium },
        { key: `${storageKeyBase}/large.webp`, buffer: args.variants.large },
    ] as const;

    for (const upload of uploads) {
        await uploadBinaryObject(upload.key, upload.buffer, "image/webp");
    }

    const largeUrl = buildPublicStorageUrl(`${storageKeyBase}/large.webp`);

    return {
        // DB column kept for compatibility — points at large, not a separate original file.
        originalUrl: largeUrl,
        thumbnailUrl: buildPublicStorageUrl(`${storageKeyBase}/thumbnail.webp`),
        mediumUrl: buildPublicStorageUrl(`${storageKeyBase}/medium.webp`),
        largeUrl,
    };
}

export async function deleteStoredApartmentImage(
    apartmentId: string,
    imageId: string,
) {
    const supabase = createServerSupabaseClient();
    const storageKeyBase = buildStorageKeyBase(apartmentId, imageId);
    const keys = [
        `${storageKeyBase}/original.webp`,
        `${storageKeyBase}/thumbnail.webp`,
        `${storageKeyBase}/medium.webp`,
        `${storageKeyBase}/large.webp`,
        `${storageKeyBase}/raw-upload`,
    ];

    const { error } = await supabase.storage
        .from(APARTMENT_IMAGES_BUCKET)
        .remove(keys);

    if (error) {
        throw new Error(`Failed to delete storage objects: ${error.message}`);
    }
}

export async function downloadStorageObject(storageKey: string): Promise<Buffer> {
    const { supabaseUrl, serviceKey } = requireSupabaseUploadEnv();
    const response = await fetch(
        `${supabaseUrl}/storage/v1/object/${APARTMENT_IMAGES_BUCKET}/${storageKey}`,
        {
            headers: { Authorization: `Bearer ${serviceKey}` },
        },
    );

    if (!response.ok) {
        throw new Error(
            `Failed to download ${storageKey}: ${response.status} ${response.statusText}`,
        );
    }

    return Buffer.from(await response.arrayBuffer());
}

export async function createRawUploadSignedUrl(
    apartmentId: string,
    imageId: string,
) {
    await ensureApartmentImagesBucket();
    const supabase = createServerSupabaseClient();
    const path = buildRawUploadKey(apartmentId, imageId);
    const { data, error } = await supabase.storage
        .from(APARTMENT_IMAGES_BUCKET)
        .createSignedUploadUrl(path);

    if (error || !data) {
        throw new Error(
            `Failed to create upload URL: ${error?.message ?? "unknown error"}`,
        );
    }

    return {
        path: data.path,
        token: data.token,
    };
}

export async function downloadRawUpload(
    apartmentId: string,
    imageId: string,
): Promise<Buffer> {
    const buffer = await downloadStorageObject(
        buildRawUploadKey(apartmentId, imageId),
    );

    try {
        await sharp(buffer).metadata();
    } catch {
        throw new Error(
            "Uploaded file could not be read as an image. Please retry with a JPEG, PNG, or WebP photo.",
        );
    }

    return buffer;
}

export async function deleteRawUpload(apartmentId: string, imageId: string) {
    const supabase = createServerSupabaseClient();
    const path = buildRawUploadKey(apartmentId, imageId);
    const { error } = await supabase.storage
        .from(APARTMENT_IMAGES_BUCKET)
        .remove([path]);

    if (error) {
        throw new Error(`Failed to delete temporary upload: ${error.message}`);
    }
}
