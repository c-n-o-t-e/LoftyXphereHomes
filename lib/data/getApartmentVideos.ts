import { getActiveApartments } from "@/lib/data/apartments";
import { prisma } from "@/lib/db";
import type { ApartmentVideoSummary } from "@/lib/videos/types";

export async function getApartmentVideoSummariesMap(): Promise<
    Record<string, ApartmentVideoSummary>
> {
    const activeApartments = getActiveApartments();
    const map: Record<string, ApartmentVideoSummary> = {};

    if (activeApartments.length === 0) {
        return map;
    }

    try {
        const rows = await prisma.apartmentVideo.findMany({
            where: {
                apartmentId: { in: activeApartments.map((apartment) => apartment.id) },
            },
            select: {
                apartmentId: true,
                posterUrl: true,
            },
        });

        for (const row of rows) {
            map[row.apartmentId] = {
                apartmentId: row.apartmentId,
                posterUrl: row.posterUrl,
            };
        }
    } catch (err) {
        console.error("Failed to load apartment video summaries:", err);
    }

    return map;
}

export async function apartmentHasVideoTour(apartmentId: string): Promise<boolean> {
    try {
        const count = await prisma.apartmentVideo.count({
            where: { apartmentId },
        });
        return count > 0;
    } catch (err) {
        console.error(`Failed to check apartment video for ${apartmentId}:`, err);
        return false;
    }
}
