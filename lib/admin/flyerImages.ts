import { randomUUID } from "crypto";
import { processApartmentImage, validateImageInput } from "@/lib/images/process";
import {
    createRawUploadSignedUrl,
    deleteRawUpload,
    downloadRawUpload,
    uploadImageVariants,
} from "@/lib/images/storage";
import {
    ALLOWED_IMAGE_MIME_TYPES,
    APARTMENT_IMAGE_MAX_BYTES,
    APARTMENT_IMAGES_BUCKET,
} from "@/lib/images/constants";

function flyerStorageApartmentId(flyerId: string) {
    return `flyer__${flyerId}`;
}

function validateUploadMeta(args: { mimeType: string; fileSize: number }) {
    const mimeType = args.mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
    if (!ALLOWED_IMAGE_MIME_TYPES.has(mimeType)) {
        throw Object.assign(
            new Error("Unsupported file type. Upload JPEG, PNG, WebP, or HEIC."),
            { statusCode: 400 },
        );
    }
    if (args.fileSize > APARTMENT_IMAGE_MAX_BYTES) {
        throw Object.assign(
            new Error(
                `File exceeds maximum size of ${Math.round(APARTMENT_IMAGE_MAX_BYTES / (1024 * 1024))}MB.`,
            ),
            { statusCode: 400 },
        );
    }
    return mimeType;
}

export async function initFlyerImageDirectUpload(args: {
    flyerId: string;
    mimeType: string;
    fileSize: number;
}) {
    validateUploadMeta(args);
    const imageId = randomUUID();
    const storageApartmentId = flyerStorageApartmentId(args.flyerId);
    const { path, token } = await createRawUploadSignedUrl(storageApartmentId, imageId);

    return {
        imageId,
        bucket: APARTMENT_IMAGES_BUCKET,
        path,
        token,
        mode: "create" as const,
    };
}

export async function completeFlyerImageDirectUpload(args: {
    flyerId: string;
    imageId: string;
    mimeType: string;
}) {
    const storageApartmentId = flyerStorageApartmentId(args.flyerId);
    const buffer = await downloadRawUpload(storageApartmentId, args.imageId);
    const validation = validateImageInput({
        buffer,
        mimeType: args.mimeType,
    });
    if (!validation.ok) {
        throw Object.assign(new Error(validation.error), { statusCode: 400 });
    }

    const processed = await processApartmentImage(buffer);
    const urls = await uploadImageVariants({
        apartmentId: storageApartmentId,
        imageId: args.imageId,
        variants: {
            thumbnail: processed.thumbnail.buffer,
            medium: processed.medium.buffer,
            large: processed.large.buffer,
        },
    });

    try {
        await deleteRawUpload(storageApartmentId, args.imageId);
    } catch (cleanupError) {
        console.warn("Failed to delete temporary flyer raw upload:", cleanupError);
    }

    return {
        imageId: args.imageId,
        thumbnailUrl: urls.thumbnailUrl,
        mediumUrl: urls.mediumUrl,
        largeUrl: urls.largeUrl,
        blurDataUrl: processed.blurDataUrl,
    };
}
