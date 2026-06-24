import { unstable_noStore as noStore } from "next/cache";
import { ensureDefaultPropertyAmenities } from "@/lib/admin/propertyAmenities";
import { prisma } from "@/lib/db";
import type { ApartmentImageSet } from "@/lib/images/types";

export type PropertyAmenityPublic = {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    description: string | null;
    displayOrder: number;
    images: ApartmentImageSet[];
    heroImage: ApartmentImageSet | null;
};

export type PropertyGalleryImageItem = {
    image: ApartmentImageSet;
    amenity: string;
    amenityId: string;
    amenitySlug: string;
};

function rowToImageSet(row: {
    thumbnailUrl: string;
    mediumUrl: string;
    largeUrl: string;
    blurDataUrl: string | null;
    altText: string | null;
}): ApartmentImageSet {
    return {
        thumbnail: row.thumbnailUrl,
        medium: row.mediumUrl,
        large: row.largeUrl,
        blurDataUrl: row.blurDataUrl,
        altText: row.altText,
    };
}

export async function getPublishedPropertyAmenities(): Promise<PropertyAmenityPublic[]> {
    noStore();
    await ensureDefaultPropertyAmenities();

    try {
        const rows = await prisma.propertyAmenity.findMany({
            where: { isPublished: true },
            orderBy: { displayOrder: "asc" },
            include: {
                images: { orderBy: { displayOrder: "asc" } },
            },
        });

        return rows.map((row) => {
            const images = row.images.map(rowToImageSet);
            return {
                id: row.id,
                slug: row.slug,
                name: row.name,
                shortDescription: row.shortDescription,
                description: row.description,
                displayOrder: row.displayOrder,
                images,
                heroImage: images[0] ?? null,
            };
        });
    } catch (err) {
        console.error("Failed to load property amenities:", err);
        return [];
    }
}

/** Amenities with at least one image — for homepage teaser cards. */
export async function getPublishedPropertyAmenitiesWithImages(): Promise<
    PropertyAmenityPublic[]
> {
    const amenities = await getPublishedPropertyAmenities();
    return amenities.filter((amenity) => amenity.images.length > 0);
}

export async function getPropertyGalleryImages(): Promise<PropertyGalleryImageItem[]> {
    const amenities = await getPublishedPropertyAmenities();
    return amenities.flatMap((amenity) =>
        amenity.images.map((image) => ({
            image,
            amenity: amenity.name,
            amenityId: amenity.id,
            amenitySlug: amenity.slug,
        })),
    );
}
