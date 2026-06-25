import { getActiveApartments, apartments } from "@/lib/data/apartments";
import { prisma } from "@/lib/db";
import type { ApartmentImageSet } from "@/lib/images/types";
import type { Apartment } from "@/lib/types";

export type GalleryImageItem = {
    image: ApartmentImageSet;
    apartment: string;
    apartmentId: string;
};

function mapRowsToImageSets(
    rows: Array<{
        thumbnailUrl: string;
        mediumUrl: string;
        largeUrl: string;
        blurDataUrl: string | null;
        altText: string | null;
    }>,
): ApartmentImageSet[] {
    return rows.map((row) => ({
        thumbnail: row.thumbnailUrl,
        medium: row.mediumUrl,
        large: row.largeUrl,
        blurDataUrl: row.blurDataUrl,
        altText: row.altText,
    }));
}

export async function getApartmentImageSets(
    apartmentId: string,
): Promise<ApartmentImageSet[]> {
    try {
        const rows = await prisma.apartmentImage.findMany({
            where: { apartmentId },
            orderBy: { displayOrder: "asc" },
            select: {
                thumbnailUrl: true,
                mediumUrl: true,
                largeUrl: true,
                blurDataUrl: true,
                altText: true,
            },
        });

        if (rows.length > 0) {
            return mapRowsToImageSets(rows);
        }
    } catch (err) {
        console.error(`Failed to load images for ${apartmentId}:`, err);
    }

    return [];
}

/** Flat URL list for components that still expect string[]. Prefers large variant. */
export async function getApartmentDisplayUrls(apartmentId: string): Promise<string[]> {
    const sets = await getApartmentImageSets(apartmentId);
    return sets.map((set) => set.large || set.medium || set.thumbnail);
}

export async function getApartmentImageCounts(): Promise<Record<string, number>> {
    const grouped = await prisma.apartmentImage.groupBy({
        by: ["apartmentId"],
        _count: { _all: true },
    });

    const counts: Record<string, number> = {};
    for (const apartment of apartments) {
        counts[apartment.id] = 0;
    }
    for (const row of grouped) {
        counts[row.apartmentId] = row._count._all;
    }
    return counts;
}

/** Batch-load image sets for multiple apartments (one DB query). */
export async function getApartmentImageSetsMap(
    apartmentIds: string[],
): Promise<Record<string, ApartmentImageSet[]>> {
    const uniqueIds = [...new Set(apartmentIds)];
    const map: Record<string, ApartmentImageSet[]> = Object.fromEntries(
        uniqueIds.map((id) => [id, []]),
    );

    if (uniqueIds.length === 0) {
        return map;
    }

    try {
        const rows = await prisma.apartmentImage.findMany({
            where: { apartmentId: { in: uniqueIds } },
            orderBy: [{ apartmentId: "asc" }, { displayOrder: "asc" }],
            select: {
                apartmentId: true,
                thumbnailUrl: true,
                mediumUrl: true,
                largeUrl: true,
                blurDataUrl: true,
                altText: true,
            },
        });

        for (const row of rows) {
            map[row.apartmentId]?.push({
                thumbnail: row.thumbnailUrl,
                medium: row.mediumUrl,
                large: row.largeUrl,
                blurDataUrl: row.blurDataUrl,
                altText: row.altText,
            });
        }
    } catch (err) {
        console.error("Failed to batch-load apartment images:", err);
    }

    return map;
}

/** Merge static apartment catalog with production image URLs when available. */
export async function enrichApartmentsWithImages<T extends Apartment>(
    source: T[],
): Promise<T[]> {
    const imageMap = await getApartmentImageSetsMap(source.map((a) => a.id));
    return source.map((apartment) => {
        const sets = imageMap[apartment.id];
        if (!sets?.length) return apartment;
        return {
            ...apartment,
            images: sets.map((set) => set.large || set.medium || set.thumbnail),
        };
    });
}

/** Flat gallery feed across active listings for the /gallery page. */
export async function getGalleryImages(): Promise<GalleryImageItem[]> {
    const imageMap = await getApartmentImageSetsMap(
        getActiveApartments().map((a) => a.id),
    );
    return getActiveApartments().flatMap((apartment) =>
        (imageMap[apartment.id] ?? []).map((image) => ({
            image,
            apartment: apartment.name,
            apartmentId: apartment.id,
        })),
    );
}

export async function getAllApartmentImageSetsMap(): Promise<
    Record<string, ApartmentImageSet[]>
> {
    const activeApartments = getActiveApartments();
    const map: Record<string, ApartmentImageSet[]> = Object.fromEntries(
        activeApartments.map((apartment) => [apartment.id, []]),
    );

    try {
        const rows = await prisma.apartmentImage.findMany({
            where: { apartmentId: { in: activeApartments.map((a) => a.id) } },
            orderBy: [{ apartmentId: "asc" }, { displayOrder: "asc" }],
            select: {
                apartmentId: true,
                thumbnailUrl: true,
                mediumUrl: true,
                largeUrl: true,
                blurDataUrl: true,
                altText: true,
            },
        });

        for (const row of rows) {
            map[row.apartmentId] ??= [];
            map[row.apartmentId].push({
                thumbnail: row.thumbnailUrl,
                medium: row.mediumUrl,
                large: row.largeUrl,
                blurDataUrl: row.blurDataUrl,
                altText: row.altText,
            });
        }
    } catch (err) {
        console.error("Failed to load apartment image map:", err);
    }

    return map;
}
