import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
    APARTMENT_VIDEO_MAX_BYTES,
    HERO_VIDEO_MAX_BYTES,
} from "@/lib/videos/constants";
import {
    APARTMENT_IMAGES_BUCKET,
    APARTMENT_IMAGE_MAX_BYTES,
    APARTMENT_STORAGE_MIME_TYPES,
    SUPABASE_STORAGE_MAX_FILE_BYTES,
    resolveBucketFileSizeLimitBytes,
} from "./constants";

const BUCKET_FILE_SIZE_LIMIT_BYTES = resolveBucketFileSizeLimitBytes({
    apartmentImageMaxBytes: APARTMENT_IMAGE_MAX_BYTES,
    heroVideoMaxBytes: HERO_VIDEO_MAX_BYTES,
    apartmentVideoMaxBytes: APARTMENT_VIDEO_MAX_BYTES,
    supabasePlanMaxBytes: SUPABASE_STORAGE_MAX_FILE_BYTES,
});

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

    const bucketConfig = {
        public: true,
        fileSizeLimit: BUCKET_FILE_SIZE_LIMIT_BYTES,
        allowedMimeTypes: [...APARTMENT_STORAGE_MIME_TYPES],
    };

    if (!existing) {
        const { error: createError } = await supabase.storage.createBucket(
            APARTMENT_IMAGES_BUCKET,
            bucketConfig,
        );

        if (createError && !createError.message.toLowerCase().includes("already exists")) {
            throw new Error(
                `Failed to create storage bucket "${APARTMENT_IMAGES_BUCKET}": ${createError.message}`,
            );
        }
        return;
    }

    const { error: updateError } = await supabase.storage.updateBucket(
        APARTMENT_IMAGES_BUCKET,
        bucketConfig,
    );

    if (updateError) {
        // Bucket already exists — don't block uploads/listing if metadata sync fails.
        console.warn(
            `Could not sync storage bucket "${APARTMENT_IMAGES_BUCKET}" settings:`,
            updateError.message,
        );
    }
}
