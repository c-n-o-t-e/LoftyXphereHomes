import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
    APARTMENT_IMAGES_BUCKET,
    APARTMENT_IMAGE_MAX_BYTES,
    APARTMENT_STORAGE_MIME_TYPES,
} from "./constants";

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
        fileSizeLimit: APARTMENT_IMAGE_MAX_BYTES,
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
        throw new Error(
            `Failed to update storage bucket "${APARTMENT_IMAGES_BUCKET}": ${updateError.message}`,
        );
    }
}
