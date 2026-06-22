import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
    APARTMENT_IMAGES_BUCKET,
    APARTMENT_IMAGE_MAX_BYTES,
} from "./constants";

export function buildStorageKeyBase(apartmentId: string, imageId: string) {
    return `apartments/${apartmentId}/${imageId}`;
}

export function buildPublicStorageUrl(storageKey: string): string {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
    if (!supabaseUrl) {
        throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
    }
    return `${supabaseUrl}/storage/v1/object/public/${APARTMENT_IMAGES_BUCKET}/${storageKey}`;
}

export async function ensureApartmentImagesBucket() {
    const supabase = createServerSupabaseClient();
    const { data: existing, error: getError } = await supabase.storage.getBucket(
        APARTMENT_IMAGES_BUCKET,
    );

    if (getError && !getError.message.toLowerCase().includes("not found")) {
        throw new Error(
            `Could not verify storage bucket "${APARTMENT_IMAGES_BUCKET}": ${getError.message}`,
        );
    }

    if (existing) return;

    const { error: createError } = await supabase.storage.createBucket(
        APARTMENT_IMAGES_BUCKET,
        {
            public: true,
            fileSizeLimit: APARTMENT_IMAGE_MAX_BYTES,
        },
    );

    if (createError && !createError.message.toLowerCase().includes("already exists")) {
        throw new Error(
            `Failed to create storage bucket "${APARTMENT_IMAGES_BUCKET}": ${createError.message}`,
        );
    }
}

export async function uploadImageVariants(args: {
    apartmentId: string;
    imageId: string;
    variants: {
        original: Buffer;
        thumbnail: Buffer;
        medium: Buffer;
        large: Buffer;
    };
}) {
    await ensureApartmentImagesBucket();
    const supabase = createServerSupabaseClient();
    const storageKeyBase = buildStorageKeyBase(args.apartmentId, args.imageId);

    const uploads = [
        { key: `${storageKeyBase}/original.webp`, buffer: args.variants.original },
        { key: `${storageKeyBase}/thumbnail.webp`, buffer: args.variants.thumbnail },
        { key: `${storageKeyBase}/medium.webp`, buffer: args.variants.medium },
        { key: `${storageKeyBase}/large.webp`, buffer: args.variants.large },
    ] as const;

    for (const upload of uploads) {
        const { error } = await supabase.storage
            .from(APARTMENT_IMAGES_BUCKET)
            .upload(upload.key, upload.buffer, {
                contentType: "image/webp",
                upsert: true,
                cacheControl: "public, max-age=31536000, immutable",
            });

        if (error) {
            throw new Error(`Failed to upload ${upload.key}: ${error.message}`);
        }
    }

    return {
        originalUrl: buildPublicStorageUrl(`${storageKeyBase}/original.webp`),
        thumbnailUrl: buildPublicStorageUrl(`${storageKeyBase}/thumbnail.webp`),
        mediumUrl: buildPublicStorageUrl(`${storageKeyBase}/medium.webp`),
        largeUrl: buildPublicStorageUrl(`${storageKeyBase}/large.webp`),
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
    ];

    const { error } = await supabase.storage
        .from(APARTMENT_IMAGES_BUCKET)
        .remove(keys);

    if (error) {
        throw new Error(`Failed to delete storage objects: ${error.message}`);
    }
}
