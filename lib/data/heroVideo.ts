import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db";
import type { HeroVideoConfig } from "@/lib/videos/types";

export type HeroVideoRow = {
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
