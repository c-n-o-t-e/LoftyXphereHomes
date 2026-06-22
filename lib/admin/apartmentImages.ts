import { randomUUID } from "crypto";
import { getApartmentById } from "@/lib/data/apartments";
import { prisma } from "@/lib/db";
import { processApartmentImage, validateImageInput } from "@/lib/images/process";
import {
    deleteStoredApartmentImage,
    uploadImageVariants,
} from "@/lib/images/storage";
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
    const processed = await processApartmentImage(args.buffer);
    const urls = await uploadImageVariants({
        apartmentId: args.apartmentId,
        imageId,
        variants: {
            original: processed.original.buffer,
            thumbnail: processed.thumbnail.buffer,
            medium: processed.medium.buffer,
            large: processed.large.buffer,
        },
    });

    const maxOrder = await prisma.apartmentImage.aggregate({
        where: { apartmentId: args.apartmentId },
        _max: { displayOrder: true },
    });
    const displayOrder = (maxOrder._max.displayOrder ?? -1) + 1;

    const row = await prisma.apartmentImage.create({
        data: {
            id: imageId,
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

    return row;
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

    const processed = await processApartmentImage(args.buffer);
    const urls = await uploadImageVariants({
        apartmentId: args.apartmentId,
        imageId: args.imageId,
        variants: {
            original: processed.original.buffer,
            thumbnail: processed.thumbnail.buffer,
            medium: processed.medium.buffer,
            large: processed.large.buffer,
        },
    });

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
