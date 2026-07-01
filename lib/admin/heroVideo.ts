import { unstable_noStore as noStore } from "next/cache";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { HERO_VIDEO_BUCKET } from "@/lib/videos/constants";
import {
    extractHeroVideoPoster,
    processHeroVideoSlot,
    validateHeroVideoUpload,
} from "@/lib/videos/process";
import {
    createHeroRawUploadSignedUrl,
    deleteHeroRawUpload,
    deleteHeroVideoStorage,
    downloadHeroRawUpload,
    uploadHeroVideoVariants,
} from "@/lib/videos/storage";
import type { HeroVideoConfig, HeroVideoUploadSlot } from "@/lib/videos/types";

type HeroVideoRow = {
    id: string;
    mobileMp4Url: string;
    desktopMp4Url: string;
    posterUrl: string;
    mobilePosterUrl: string | null;
    storageKeyBase: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

type HeroVideoUploadMeta = {
    mimeType: string;
    fileSize: number;
};

function validateUploadMeta(args: HeroVideoUploadMeta, label: string) {
    const mimeType = args.mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
    if (!mimeType) {
        throw Object.assign(new Error(`Missing ${label} video type.`), {
            statusCode: 400,
        });
    }
    if (args.fileSize <= 0) {
        throw Object.assign(new Error(`${label} video file is empty.`), {
            statusCode: 400,
        });
    }
}

export function serializeHeroVideo(row: HeroVideoRow): HeroVideoConfig {
    return {
        id: row.id,
        mobileMp4Url: row.mobileMp4Url,
        desktopMp4Url: row.desktopMp4Url,
        posterUrl: row.posterUrl,
        mobilePosterUrl: row.mobilePosterUrl,
        updatedAt: row.updatedAt.toISOString(),
    };
}

export async function getActiveHeroVideo(): Promise<HeroVideoRow | null> {
    try {
        return await prisma.heroVideo.findFirst({
            where: { isActive: true },
            orderBy: { updatedAt: "desc" },
        });
    } catch (err) {
        console.error("Failed to load hero video:", err);
        return null;
    }
}

export async function getPublicHeroVideo(): Promise<HeroVideoConfig | null> {
    noStore();
    const row = await getActiveHeroVideo();
    return row ? serializeHeroVideo(row) : null;
}

export async function initHeroVideoPairUpload(args: {
    mobile: HeroVideoUploadMeta;
    desktop: HeroVideoUploadMeta;
}) {
    validateUploadMeta(args.mobile, "Mobile");
    validateUploadMeta(args.desktop, "Desktop");

    const heroId = randomUUID();
    const [mobileSigned, desktopSigned] = await Promise.all([
        createHeroRawUploadSignedUrl(heroId, "mobile"),
        createHeroRawUploadSignedUrl(heroId, "desktop"),
    ]);

    return {
        heroId,
        bucket: HERO_VIDEO_BUCKET,
        uploads: {
            mobile: {
                path: mobileSigned.path,
                token: mobileSigned.token,
            },
            desktop: {
                path: desktopSigned.path,
                token: desktopSigned.token,
            },
        },
    };
}

async function deactivateExistingHeroVideos() {
    const existing = await prisma.heroVideo.findMany({ where: { isActive: true } });
    for (const row of existing) {
        await deleteHeroVideoStorage(row.storageKeyBase);
    }
    await prisma.heroVideo.updateMany({
        where: { isActive: true },
        data: { isActive: false },
    });
    if (existing.length > 0) {
        await prisma.heroVideo.deleteMany({
            where: { id: { in: existing.map((row) => row.id) } },
        });
    }
}

async function cleanupHeroRawUploads(heroId: string) {
    const slots: HeroVideoUploadSlot[] = ["mobile", "desktop"];
    for (const slot of slots) {
        try {
            await deleteHeroRawUpload(heroId, slot);
        } catch (cleanupError) {
            console.warn(`Failed to delete temporary hero ${slot} upload:`, cleanupError);
        }
    }
}

export async function completeHeroVideoDirectUpload(args: {
    heroId: string;
    mobileMimeType: string;
    desktopMimeType: string;
}) {
    try {
        const [mobileRaw, desktopRaw] = await Promise.all([
            downloadHeroRawUpload(args.heroId, "mobile"),
            downloadHeroRawUpload(args.heroId, "desktop"),
        ]);

        const mobileValidation = validateHeroVideoUpload({
            buffer: mobileRaw,
            mimeType: args.mobileMimeType,
        });
        if (!mobileValidation.ok) {
            throw Object.assign(new Error(mobileValidation.error), { statusCode: 400 });
        }

        const desktopValidation = validateHeroVideoUpload({
            buffer: desktopRaw,
            mimeType: args.desktopMimeType,
        });
        if (!desktopValidation.ok) {
            throw Object.assign(new Error(desktopValidation.error), { statusCode: 400 });
        }

        const [mobile, desktop, desktopPoster, mobilePoster] = await Promise.all([
            processHeroVideoSlot(mobileRaw, "mobile"),
            processHeroVideoSlot(desktopRaw, "desktop"),
            extractHeroVideoPoster(desktopRaw),
            extractHeroVideoPoster(mobileRaw),
        ]);

        await deactivateExistingHeroVideos();

        const urls = await uploadHeroVideoVariants({
            heroId: args.heroId,
            variants: {
                mobile,
                desktop,
                poster: desktopPoster,
                mobilePoster,
            },
        });

        return prisma.heroVideo.create({
            data: {
                id: args.heroId,
                mobileMp4Url: urls.mobileMp4Url,
                desktopMp4Url: urls.desktopMp4Url,
                posterUrl: urls.posterUrl,
                mobilePosterUrl: urls.mobilePosterUrl,
                storageKeyBase: urls.storageKeyBase,
                isActive: true,
            },
        });
    } finally {
        await cleanupHeroRawUploads(args.heroId);
    }
}

export async function deleteActiveHeroVideo() {
    const row = await getActiveHeroVideo();
    if (!row) {
        throw Object.assign(new Error("No hero video configured."), { statusCode: 404 });
    }
    await deleteHeroVideoStorage(row.storageKeyBase);
    await prisma.heroVideo.delete({ where: { id: row.id } });
    return row;
}
