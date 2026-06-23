import { getApartmentById, apartments, getActiveApartments } from "@/lib/data/apartments";
import { prisma } from "@/lib/db";
import { legacyUrlsToImageSets } from "@/lib/images/urls";
import type { ApartmentImageSet } from "@/lib/images/types";
import type { Apartment } from "@/lib/types";

const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80";

export type GalleryImageItem = {
    image: ApartmentImageSet;
    apartment: string;
    apartmentId: string;
};

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
            return rows.map((row) => ({
                thumbnail: row.thumbnailUrl,
                medium: row.mediumUrl,
                large: row.largeUrl,
                blurDataUrl: row.blurDataUrl,
                altText: row.altText,
            }));
        }
    } catch (err) {
        console.error(`Failed to load images for ${apartmentId}:`, err);
    }

    const apartment = getApartmentById(apartmentId);
    if (!apartment?.images?.length) {
        return legacyUrlsToImageSets([FALLBACK_IMAGE]);
    }

    return legacyUrlsToImageSets(apartment.images);
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

    const map: Record<string, ApartmentImageSet[]> = {};
    for (const id of uniqueIds) {
        map[id] = [];
    }
    for (const row of rows) {
        map[row.apartmentId]?.push({
            thumbnail: row.thumbnailUrl,
            medium: row.mediumUrl,
            large: row.largeUrl,
            blurDataUrl: row.blurDataUrl,
            altText: row.altText,
        });
    }

    for (const id of uniqueIds) {
        if (map[id]!.length > 0) continue;
        const apartment = getApartmentById(id);
        map[id] =
            apartment?.images?.length
                ? legacyUrlsToImageSets(apartment.images)
                : legacyUrlsToImageSets([FALLBACK_IMAGE]);
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
    const map: Record<string, ApartmentImageSet[]> = {};
    for (const apartment of activeApartments) {
        map[apartment.id] = legacyUrlsToImageSets(apartment.images);
    }

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

        for (const apartment of activeApartments) {
            map[apartment.id] = [];
        }

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

        for (const apartment of activeApartments) {
            if (map[apartment.id].length === 0) {
                map[apartment.id] = legacyUrlsToImageSets(apartment.images);
            }
        }
    } catch (err) {
        console.error("Failed to load apartment image map:", err);
    }

    return map;
}
