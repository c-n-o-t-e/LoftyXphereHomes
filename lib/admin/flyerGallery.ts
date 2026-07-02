import { serializeApartmentImage } from "@/lib/admin/apartmentImages";
import { serializePropertyAmenityImage } from "@/lib/admin/propertyAmenityImages";
import { getApartmentById } from "@/lib/data/apartments";
import { prisma } from "@/lib/db";

export type FlyerGalleryImageSource = "apartment" | "amenity";

export type FlyerGalleryImage = {
    id: string;
    source: FlyerGalleryImageSource;
    sourceId: string;
    sourceName: string;
    thumbnailUrl: string;
    mediumUrl: string;
    largeUrl: string;
    altText: string | null;
    displayOrder: number;
};

export async function listFlyerGalleryImages(): Promise<FlyerGalleryImage[]> {
    const [apartmentRows, amenityRows] = await Promise.all([
        prisma.apartmentImage.findMany({
            orderBy: [{ apartmentId: "asc" }, { displayOrder: "asc" }],
        }),
        prisma.propertyAmenityImage.findMany({
            orderBy: [{ amenityId: "asc" }, { displayOrder: "asc" }],
            include: {
                amenity: { select: { name: true } },
            },
        }),
    ]);

    const apartmentImages: FlyerGalleryImage[] = apartmentRows.map((row) => {
        const serialized = serializeApartmentImage(row);
        const apartment = getApartmentById(row.apartmentId);
        return {
            id: serialized.id,
            source: "apartment",
            sourceId: serialized.apartmentId,
            sourceName: apartment?.name ?? serialized.apartmentId,
            thumbnailUrl: serialized.thumbnailUrl,
            mediumUrl: serialized.mediumUrl,
            largeUrl: serialized.largeUrl,
            altText: serialized.altText,
            displayOrder: serialized.displayOrder,
        };
    });

    const amenityImages: FlyerGalleryImage[] = amenityRows.map((row) => {
        const serialized = serializePropertyAmenityImage(row);
        return {
            id: serialized.id,
            source: "amenity",
            sourceId: serialized.amenityId,
            sourceName: row.amenity.name,
            thumbnailUrl: serialized.thumbnailUrl,
            mediumUrl: serialized.mediumUrl,
            largeUrl: serialized.largeUrl,
            altText: serialized.altText,
            displayOrder: serialized.displayOrder,
        };
    });

    return [...apartmentImages, ...amenityImages];
}
