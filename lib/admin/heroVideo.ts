import { unstable_noStore as noStore } from "next/cache";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { HERO_VIDEO_BUCKET } from "@/lib/videos/constants";
import { processHeroVideo, validateHeroVideoUpload } from "@/lib/videos/process";
import {
    createHeroRawUploadSignedUrl,
    deleteHeroRawUpload,
    deleteHeroVideoStorage,
    downloadHeroRawUpload,
    uploadHeroVideoVariants,
} from "@/lib/videos/storage";
import type { HeroVideoConfig } from "@/lib/videos/types";

type HeroVideoRow = {
    id: string;
    mobileMp4Url: string;
    desktopMp4Url: string;
    posterUrl: string;
    storageKeyBase: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export function serializeHeroVideo(row: HeroVideoRow): HeroVideoConfig {
    return {
        id: row.id,
        mobileMp4Url: row.mobileMp4Url,
        desktopMp4Url: row.desktopMp4Url,
        posterUrl: row.posterUrl,
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

export async function initHeroVideoDirectUpload(args: {
    mimeType: string;
    fileSize: number;
}) {
    const mimeType = args.mimeType.toLowerCase().split(";")[0]?.trim() ?? "";
    if (!mimeType) {
        throw Object.assign(new Error("Missing video type."), { statusCode: 400 });
    }
    if (args.fileSize <= 0) {
        throw Object.assign(new Error("Video file is empty."), { statusCode: 400 });
    }

    const heroId = randomUUID();
    const signed = await createHeroRawUploadSignedUrl(heroId);
    return {
        heroId,
        bucket: HERO_VIDEO_BUCKET,
        path: signed.path,
        token: signed.token,
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

export async function completeHeroVideoDirectUpload(args: {
    heroId: string;
    mimeType: string;
}) {
    try {
        const buffer = await downloadHeroRawUpload(args.heroId);
        const validation = validateHeroVideoUpload({
            buffer,
            mimeType: args.mimeType,
        });
        if (!validation.ok) {
            throw Object.assign(new Error(validation.error), { statusCode: 400 });
        }

        const processed = await processHeroVideo(buffer);
        const mobile = processed.variants.find((v) => v.name === "mobile")?.buffer;
        const desktop = processed.variants.find((v) => v.name === "desktop")?.buffer;
        const poster = processed.variants.find((v) => v.name === "poster")?.buffer;
        if (!mobile || !desktop || !poster) {
            throw new Error("Video processing failed to produce all variants.");
        }

        await deactivateExistingHeroVideos();

        const urls = await uploadHeroVideoVariants({
            heroId: args.heroId,
            variants: { mobile, desktop, poster },
        });

        return prisma.heroVideo.create({
            data: {
                id: args.heroId,
                mobileMp4Url: urls.mobileMp4Url,
                desktopMp4Url: urls.desktopMp4Url,
                posterUrl: urls.posterUrl,
                storageKeyBase: urls.storageKeyBase,
                isActive: true,
            },
        });
    } finally {
        try {
            await deleteHeroRawUpload(args.heroId);
        } catch (cleanupError) {
            console.warn("Failed to delete temporary hero upload:", cleanupError);
        }
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
