import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { getPropertyAmenityById } from "@/lib/admin/propertyAmenities";
import { processApartmentImage, validateImageInput } from "@/lib/images/process";
import {
    APARTMENT_IMAGES_BUCKET,
    APARTMENT_IMAGE_MAX_BYTES,
    ALLOWED_IMAGE_MIME_TYPES,
} from "@/lib/images/constants";
import {
    createPropertyAmenityRawUploadSignedUrl,
    deletePropertyAmenityRawUpload,
    deleteStoredPropertyAmenityImage,
    downloadPropertyAmenityRawUpload,
    uploadPropertyAmenityImageVariants,
} from "@/lib/images/propertyAmenityStorage";

type PropertyAmenityImageRow = {
    id: string;
    amenityId: string;
    thumbnailUrl: string;
    mediumUrl: string;
    largeUrl: string;
    blurDataUrl: string | null;
    altText: string | null;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
};

export function serializePropertyAmenityImage(row: PropertyAmenityImageRow) {
    return {
        id: row.id,
        amenityId: row.amenityId,
        thumbnailUrl: row.thumbnailUrl,
        mediumUrl: row.mediumUrl,
        largeUrl: row.largeUrl,
        blurDataUrl: row.blurDataUrl,
        altText: row.altText,
        displayOrder: row.displayOrder,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}

async function assertPropertyAmenityExists(amenityId: string) {
    const amenity = await getPropertyAmenityById(amenityId);
    if (!amenity) {
        throw Object.assign(new Error("Property amenity not found"), { statusCode: 404 });
    }
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

async function persistProcessedImage(args: {
    amenityId: string;
    imageId: string;
    buffer: Buffer;
    altText?: string | null;
}) {
    const processed = await processApartmentImage(args.buffer);
    const urls = await uploadPropertyAmenityImageVariants({
        amenityId: args.amenityId,
        imageId: args.imageId,
        variants: {
            thumbnail: processed.thumbnail.buffer,
            medium: processed.medium.buffer,
            large: processed.large.buffer,
        },
    });

    const maxOrder = await prisma.propertyAmenityImage.aggregate({
        where: { amenityId: args.amenityId },
        _max: { displayOrder: true },
    });
    const displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;

    return prisma.propertyAmenityImage.create({
        data: {
            id: args.imageId,
            amenityId: args.amenityId,
            thumbnailUrl: urls.thumbnailUrl,
            mediumUrl: urls.mediumUrl,
            largeUrl: urls.largeUrl,
            blurDataUrl: processed.blurDataUrl,
            altText: args.altText?.trim() || null,
            displayOrder,
        },
    });
}

export async function initPropertyAmenityImageDirectUpload(args: {
    amenityId: string;
    mimeType: string;
    fileSize: number;
}) {
    await assertPropertyAmenityExists(args.amenityId);
    validateUploadMeta(args);

    const imageId = randomUUID();
    const signed = await createPropertyAmenityRawUploadSignedUrl(
        args.amenityId,
        imageId,
    );

    return {
        imageId,
        bucket: APARTMENT_IMAGES_BUCKET,
        path: signed.path,
        token: signed.token,
        mode: "create" as const,
    };
}

export async function completePropertyAmenityImageDirectUpload(args: {
    amenityId: string;
    imageId: string;
    mimeType: string;
    altText?: string | null;
}) {
    await assertPropertyAmenityExists(args.amenityId);

    try {
        const buffer = await downloadPropertyAmenityRawUpload(
            args.amenityId,
            args.imageId,
        );
        const validation = validateImageInput({
            buffer,
            mimeType: args.mimeType,
        });
        if (!validation.ok) {
            throw Object.assign(new Error(validation.error), { statusCode: 400 });
        }

        return await persistProcessedImage({
            amenityId: args.amenityId,
            imageId: args.imageId,
            buffer,
            altText: args.altText,
        });
    } finally {
        try {
            await deletePropertyAmenityRawUpload(args.amenityId, args.imageId);
        } catch (cleanupError) {
            console.warn("Failed to delete temporary raw upload:", cleanupError);
        }
    }
}

export async function deletePropertyAmenityImage(args: {
    amenityId: string;
    imageId: string;
}) {
    const existing = await prisma.propertyAmenityImage.findFirst({
        where: { id: args.imageId, amenityId: args.amenityId },
    });
    if (!existing) {
        throw Object.assign(new Error("Image not found"), { statusCode: 404 });
    }

    await deleteStoredPropertyAmenityImage(args.amenityId, args.imageId);
    await prisma.propertyAmenityImage.delete({ where: { id: args.imageId } });
    return existing;
}

export async function reorderPropertyAmenityImages(args: {
    amenityId: string;
    imageIds: string[];
}) {
    await assertPropertyAmenityExists(args.amenityId);

    const existing = await prisma.propertyAmenityImage.findMany({
        where: { amenityId: args.amenityId },
        orderBy: { displayOrder: "asc" },
    });

    const existingIds = new Set(existing.map((row) => row.id));
    if (
        args.imageIds.length !== existing.length ||
        args.imageIds.some((id) => !existingIds.has(id))
    ) {
        throw Object.assign(new Error("Invalid image order payload"), {
            statusCode: 400,
        });
    }

    await prisma.$transaction(
        args.imageIds.map((imageId, index) =>
            prisma.propertyAmenityImage.update({
                where: { id: imageId },
                data: { displayOrder: index },
            }),
        ),
    );

    return prisma.propertyAmenityImage.findMany({
        where: { amenityId: args.amenityId },
        orderBy: { displayOrder: "asc" },
    });
}
