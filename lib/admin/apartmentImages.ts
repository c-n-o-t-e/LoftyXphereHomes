import { randomUUID } from "crypto";
import { getApartmentById } from "@/lib/data/apartments";
import { prisma } from "@/lib/db";
import { processApartmentImage, validateImageInput } from "@/lib/images/process";
import {
    createRawUploadSignedUrl,
    deleteRawUpload,
    deleteStoredApartmentImage,
    downloadRawUpload,
    uploadImageVariants,
} from "@/lib/images/storage";
import {
    APARTMENT_IMAGES_BUCKET,
    APARTMENT_IMAGE_MAX_BYTES,
    ALLOWED_IMAGE_MIME_TYPES,
} from "@/lib/images/constants";
import type { ApartmentImageUrls } from "@/lib/images/types";

type ApartmentImageRow = {
    id: string;
    apartmentId: string;
    originalUrl: string;
    thumbnailUrl: string;
    mediumUrl: string;
    largeUrl: string;
    blurDataUrl: string | null;
    altText: string | null;
    displayOrder: number;
    createdAt: Date;
    updatedAt: Date;
};

export function serializeApartmentImage(row: ApartmentImageRow) {
    return {
        id: row.id,
        apartmentId: row.apartmentId,
        originalUrl: row.originalUrl,
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

function assertApartmentExists(apartmentId: string) {
    const apartment = getApartmentById(apartmentId);
    if (!apartment) {
        throw Object.assign(new Error("Apartment not found"), { statusCode: 404 });
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
    apartmentId: string;
    imageId: string;
    buffer: Buffer;
    altText?: string | null;
    mode: "create" | "replace";
}) {
    const processed = await processApartmentImage(args.buffer);
    const urls = await uploadImageVariants({
        apartmentId: args.apartmentId,
        imageId: args.imageId,
        variants: {
            thumbnail: processed.thumbnail.buffer,
            medium: processed.medium.buffer,
            large: processed.large.buffer,
        },
    });

    if (args.mode === "create") {
        const maxOrder = await prisma.apartmentImage.aggregate({
            where: { apartmentId: args.apartmentId },
            _max: { displayOrder: true },
        });
        const displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;

        return prisma.apartmentImage.create({
            data: {
                id: args.imageId,
                apartmentId: args.apartmentId,
                originalUrl: urls.originalUrl,
                thumbnailUrl: urls.thumbnailUrl,
                mediumUrl: urls.mediumUrl,
                largeUrl: urls.largeUrl,
                blurDataUrl: processed.blurDataUrl,
                altText: args.altText?.trim() || null,
                displayOrder,
            },
        });
    }

    const existing = await prisma.apartmentImage.findFirst({
        where: { id: args.imageId, apartmentId: args.apartmentId },
    });
    if (!existing) {
        throw Object.assign(new Error("Image not found"), { statusCode: 404 });
    }

    return prisma.apartmentImage.update({
        where: { id: args.imageId },
        data: {
            originalUrl: urls.originalUrl,
            thumbnailUrl: urls.thumbnailUrl,
            mediumUrl: urls.mediumUrl,
            largeUrl: urls.largeUrl,
            blurDataUrl: processed.blurDataUrl,
            altText:
                args.altText !== undefined
                    ? args.altText?.trim() || null
                    : existing.altText,
        },
    });
}

export async function initApartmentImageDirectUpload(args: {
    apartmentId: string;
    mimeType: string;
    fileSize: number;
    replaceImageId?: string;
}) {
    assertApartmentExists(args.apartmentId);
    validateUploadMeta(args);

    const imageId = args.replaceImageId ?? randomUUID();
    if (args.replaceImageId) {
        const existing = await prisma.apartmentImage.findFirst({
            where: { id: args.replaceImageId, apartmentId: args.apartmentId },
        });
        if (!existing) {
            throw Object.assign(new Error("Image not found"), { statusCode: 404 });
        }
    }

    const signed = await createRawUploadSignedUrl(args.apartmentId, imageId);
    return {
        imageId,
        bucket: APARTMENT_IMAGES_BUCKET,
        path: signed.path,
        token: signed.token,
        mode: args.replaceImageId ? ("replace" as const) : ("create" as const),
    };
}

export async function completeApartmentImageDirectUpload(args: {
    apartmentId: string;
    imageId: string;
    mimeType: string;
    altText?: string | null;
    mode: "create" | "replace";
}) {
    assertApartmentExists(args.apartmentId);

    try {
        const buffer = await downloadRawUpload(args.apartmentId, args.imageId);
        const validation = validateImageInput({
            buffer,
            mimeType: args.mimeType,
        });
        if (!validation.ok) {
            throw Object.assign(new Error(validation.error), { statusCode: 400 });
        }

        return await persistProcessedImage({
            apartmentId: args.apartmentId,
            imageId: args.imageId,
            buffer,
            altText: args.altText,
            mode: args.mode,
        });
    } finally {
        try {
            await deleteRawUpload(args.apartmentId, args.imageId);
        } catch (cleanupError) {
            console.warn("Failed to delete temporary raw upload:", cleanupError);
        }
    }
}

export async function uploadApartmentImageFile(args: {
    apartmentId: string;
    buffer: Buffer;
    mimeType: string;
    fileName?: string;
    altText?: string | null;
}) {
    assertApartmentExists(args.apartmentId);

    const validation = validateImageInput({
        buffer: args.buffer,
        mimeType: args.mimeType,
        fileName: args.fileName,
    });
    if (!validation.ok) {
        throw Object.assign(new Error(validation.error), { statusCode: 400 });
    }

    const imageId = randomUUID();
    return persistProcessedImage({
        apartmentId: args.apartmentId,
        imageId,
        buffer: args.buffer,
        altText: args.altText,
        mode: "create",
    });
}

export async function replaceApartmentImageFile(args: {
    apartmentId: string;
    imageId: string;
    buffer: Buffer;
    mimeType: string;
    fileName?: string;
    altText?: string | null;
}) {
    const existing = await prisma.apartmentImage.findFirst({
        where: { id: args.imageId, apartmentId: args.apartmentId },
    });
    if (!existing) {
        throw Object.assign(new Error("Image not found"), { statusCode: 404 });
    }

    const validation = validateImageInput({
        buffer: args.buffer,
        mimeType: args.mimeType,
        fileName: args.fileName,
    });
    if (!validation.ok) {
        throw Object.assign(new Error(validation.error), { statusCode: 400 });
    }

    return persistProcessedImage({
        apartmentId: args.apartmentId,
        imageId: args.imageId,
        buffer: args.buffer,
        altText: args.altText,
        mode: "replace",
    });
}

export async function deleteApartmentImage(args: {
    apartmentId: string;
    imageId: string;
}) {
    const existing = await prisma.apartmentImage.findFirst({
        where: { id: args.imageId, apartmentId: args.apartmentId },
    });
    if (!existing) {
        throw Object.assign(new Error("Image not found"), { statusCode: 404 });
    }

    await deleteStoredApartmentImage(args.apartmentId, args.imageId);
    await prisma.apartmentImage.delete({ where: { id: args.imageId } });
    return existing;
}

export async function deleteAllApartmentImages(apartmentId: string) {
    assertApartmentExists(apartmentId);
    const images = await prisma.apartmentImage.findMany({
        where: { apartmentId },
        orderBy: { displayOrder: "asc" },
    });

    for (const image of images) {
        await deleteStoredApartmentImage(apartmentId, image.id);
    }

    await prisma.apartmentImage.deleteMany({ where: { apartmentId } });
    return images;
}

export async function reorderApartmentImages(args: {
    apartmentId: string;
    imageIds: string[];
}) {
    assertApartmentExists(args.apartmentId);

    const existing = await prisma.apartmentImage.findMany({
        where: { apartmentId: args.apartmentId },
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
            prisma.apartmentImage.update({
                where: { id: imageId },
                data: { displayOrder: index },
            }),
        ),
    );

    return prisma.apartmentImage.findMany({
        where: { apartmentId: args.apartmentId },
        orderBy: { displayOrder: "asc" },
    });
}

export function toApartmentImageSet(row: ApartmentImageUrls) {
    return {
        thumbnail: row.thumbnailUrl,
        medium: row.mediumUrl,
        large: row.largeUrl,
        blurDataUrl: row.blurDataUrl,
        altText: row.altText,
    };
}
