import { unstable_noStore as noStore } from "next/cache";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { getApartmentById } from "@/lib/data/apartments";
import { HERO_VIDEO_BUCKET } from "@/lib/videos/constants";
import {
    processApartmentVideo,
    validateApartmentVideoUpload,
} from "@/lib/videos/process";
import {
    createApartmentVideoRawUploadSignedUrl,
    deleteApartmentVideoRawUpload,
    deleteApartmentVideoStorage,
    downloadApartmentVideoRawUpload,
    uploadApartmentVideoVariants,
} from "@/lib/videos/storage";
import type { ApartmentVideoConfig } from "@/lib/videos/types";

type ApartmentVideoRow = {
    id: string;
    apartmentId: string;
    mobileMp4Url: string;
    desktopMp4Url: string;
    posterUrl: string;
    storageKeyBase: string;
    createdAt: Date;
    updatedAt: Date;
};

export function serializeApartmentVideo(row: ApartmentVideoRow): ApartmentVideoConfig {
    return {
        id: row.id,
        apartmentId: row.apartmentId,
        mobileMp4Url: row.mobileMp4Url,
        desktopMp4Url: row.desktopMp4Url,
        posterUrl: row.posterUrl,
        updatedAt: row.updatedAt.toISOString(),
    };
}

function assertApartmentExists(apartmentId: string) {
    const apartment = getApartmentById(apartmentId);
    if (!apartment) {
        throw Object.assign(new Error("Apartment not found."), { statusCode: 404 });
    }
}

export async function getApartmentVideoRow(
    apartmentId: string,
): Promise<ApartmentVideoRow | null> {
    try {
        return await prisma.apartmentVideo.findUnique({
            where: { apartmentId },
        });
    } catch (err) {
        console.error(`Failed to load apartment video for ${apartmentId}:`, err);
        return null;
    }
}

export async function getPublicApartmentVideo(
    apartmentId: string,
): Promise<ApartmentVideoConfig | null> {
    noStore();
    const row = await getApartmentVideoRow(apartmentId);
    return row ? serializeApartmentVideo(row) : null;
}

export async function initApartmentVideoDirectUpload(args: {
    apartmentId: string;
    mimeType: string;
    fileSize: number;
}) {
    assertApartmentExists(args.apartmentId);

    const mimeType = args.mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
    if (!mimeType) {
        throw Object.assign(new Error("Missing video type."), { statusCode: 400 });
    }
    if (args.fileSize <= 0) {
        throw Object.assign(new Error("Video file is empty."), { statusCode: 400 });
    }

    const videoId = randomUUID();
    const signed = await createApartmentVideoRawUploadSignedUrl({
        apartmentId: args.apartmentId,
        videoId,
    });

    return {
        videoId,
        bucket: HERO_VIDEO_BUCKET,
        path: signed.path,
        token: signed.token,
    };
}

async function deleteExistingApartmentVideo(apartmentId: string) {
    const existing = await prisma.apartmentVideo.findUnique({
        where: { apartmentId },
    });
    if (!existing) return;

    await deleteApartmentVideoStorage(existing.storageKeyBase);
    await prisma.apartmentVideo.delete({ where: { id: existing.id } });
}

export async function completeApartmentVideoDirectUpload(args: {
    apartmentId: string;
    videoId: string;
    mimeType: string;
}) {
    assertApartmentExists(args.apartmentId);

    try {
        const buffer = await downloadApartmentVideoRawUpload({
            apartmentId: args.apartmentId,
            videoId: args.videoId,
        });
        const validation = validateApartmentVideoUpload({
            buffer,
            mimeType: args.mimeType,
        });
        if (!validation.ok) {
            throw Object.assign(new Error(validation.error), { statusCode: 400 });
        }

        const processed = await processApartmentVideo(buffer);
        const mobile = processed.variants.find((v) => v.name === "mobile")?.buffer;
        const desktop = processed.variants.find((v) => v.name === "desktop")?.buffer;
        const poster = processed.variants.find((v) => v.name === "poster")?.buffer;
        if (!mobile || !desktop || !poster) {
            throw new Error("Video processing failed to produce all variants.");
        }

        await deleteExistingApartmentVideo(args.apartmentId);

        const urls = await uploadApartmentVideoVariants({
            apartmentId: args.apartmentId,
            videoId: args.videoId,
            variants: { mobile, desktop, poster },
        });

        return prisma.apartmentVideo.create({
            data: {
                id: args.videoId,
                apartmentId: args.apartmentId,
                mobileMp4Url: urls.mobileMp4Url,
                desktopMp4Url: urls.desktopMp4Url,
                posterUrl: urls.posterUrl,
                storageKeyBase: urls.storageKeyBase,
            },
        });
    } finally {
        try {
            await deleteApartmentVideoRawUpload({
                apartmentId: args.apartmentId,
                videoId: args.videoId,
            });
        } catch (cleanupError) {
            console.warn("Failed to delete temporary apartment video upload:", cleanupError);
        }
    }
}

export async function deleteApartmentVideo(apartmentId: string) {
    assertApartmentExists(apartmentId);

    const row = await getApartmentVideoRow(apartmentId);
    if (!row) {
        throw Object.assign(new Error("No tour video configured."), { statusCode: 404 });
    }

    await deleteApartmentVideoStorage(row.storageKeyBase);
    await prisma.apartmentVideo.delete({ where: { id: row.id } });
    return row;
}
