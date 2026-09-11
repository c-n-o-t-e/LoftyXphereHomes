import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db";
import { getApartmentIdLookupIds } from "@/lib/data/apartments";
import type { ApartmentVideoConfig } from "@/lib/videos/types";

export type ApartmentVideoRow = {
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

export async function getApartmentVideoRow(
    apartmentId: string,
): Promise<ApartmentVideoRow | null> {
    try {
        return await prisma.apartmentVideo.findFirst({
            where: { apartmentId: { in: getApartmentIdLookupIds(apartmentId) } },
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
