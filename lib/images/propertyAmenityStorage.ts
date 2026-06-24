import sharp from "sharp";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { APARTMENT_IMAGES_BUCKET } from "./constants";
import { ensureApartmentImagesBucket } from "./bucket";
import { buildPublicStorageUrl, downloadStorageObject } from "./storage";

export const PROPERTY_AMENITY_STORAGE_PREFIX = "site/property-amenities";

export function buildPropertyAmenityStorageKeyBase(
    amenityId: string,
    imageId: string,
) {
    return `${PROPERTY_AMENITY_STORAGE_PREFIX}/${amenityId}/${imageId}`;
}

export function buildPropertyAmenityRawUploadKey(amenityId: string, imageId: string) {
    return `${buildPropertyAmenityStorageKeyBase(amenityId, imageId)}/raw-upload`;
}

function requireSupabaseUploadEnv() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
        throw new Error("Missing Supabase storage credentials");
    }
    return { supabaseUrl, serviceKey };
}

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
}

export async function uploadPropertyAmenityImageVariants(args: {
    amenityId: string;
    imageId: string;
    variants: {
        thumbnail: Buffer;
        medium: Buffer;
        large: Buffer;
    };
}) {
    await ensureApartmentImagesBucket();
    const storageKeyBase = buildPropertyAmenityStorageKeyBase(
        args.amenityId,
        args.imageId,
    );

    const uploads = [
        { key: `${storageKeyBase}/thumbnail.webp`, buffer: args.variants.thumbnail },
        { key: `${storageKeyBase}/medium.webp`, buffer: args.variants.medium },
        { key: `${storageKeyBase}/large.webp`, buffer: args.variants.large },
    ] as const;

    for (const upload of uploads) {
        await uploadBinaryObject(upload.key, upload.buffer, "image/webp");
    }

    return {
        thumbnailUrl: buildPublicStorageUrl(`${storageKeyBase}/thumbnail.webp`),
        mediumUrl: buildPublicStorageUrl(`${storageKeyBase}/medium.webp`),
        largeUrl: buildPublicStorageUrl(`${storageKeyBase}/large.webp`),
    };
}

export async function deleteStoredPropertyAmenityImage(
    amenityId: string,
    imageId: string,
) {
    const supabase = createServerSupabaseClient();
    const storageKeyBase = buildPropertyAmenityStorageKeyBase(amenityId, imageId);
    const keys = [
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

export async function createPropertyAmenityRawUploadSignedUrl(
    amenityId: string,
    imageId: string,
) {
    await ensureApartmentImagesBucket();
    const supabase = createServerSupabaseClient();
    const path = buildPropertyAmenityRawUploadKey(amenityId, imageId);
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

export async function downloadPropertyAmenityRawUpload(
    amenityId: string,
    imageId: string,
): Promise<Buffer> {
    const buffer = await downloadStorageObject(
        buildPropertyAmenityRawUploadKey(amenityId, imageId),
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

export async function deletePropertyAmenityRawUpload(
    amenityId: string,
    imageId: string,
) {
    const supabase = createServerSupabaseClient();
    const path = buildPropertyAmenityRawUploadKey(amenityId, imageId);
    const { error } = await supabase.storage.from(APARTMENT_IMAGES_BUCKET).remove([path]);

    if (error) {
        throw new Error(`Failed to delete temporary upload: ${error.message}`);
    }
}

export { downloadStorageObject };
