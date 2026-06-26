import { unstable_noStore as noStore } from "next/cache";
import { ensureDefaultPropertyAmenities } from "@/lib/admin/propertyAmenities";
import { prisma } from "@/lib/db";
import type { ApartmentImageSet } from "@/lib/images/types";

/** Edit slug + imageIndex to change the wide banner on /experience. */
export const EXPERIENCE_PAGE_HERO = {
    slug: "outdoor-lounge",
    /** Admin gallery label "#9" (0-based index). */
    imageIndex: 8,
} as const;

/** Edit slug + imageIndex to change photos on /about (Outdoor & common areas). */
export const ABOUT_PAGE_IMAGES = {
    slug: "outdoor-lounge",
    /** Admin gallery label "#8" — Our Story section (0-based index 7). */
    storyImageIndex: 7,
    /** Admin gallery label "#9" — Why Choose Us section (0-based index 8). */
    whyChooseUsImageIndex: 8,
} as const;

export type AboutPageImages = {
    story: ApartmentImageSet | null;
    whyChooseUs: ApartmentImageSet | null;
};

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

export async function getPublishedPropertyAmenities(): Promise<
    PropertyAmenityPublic[]
> {
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

function resolveAmenityImageByIndex(
    amenities: PropertyAmenityPublic[],
    slug: string,
    imageIndex: number,
): ApartmentImageSet | null {
    const target = amenities.find((amenity) => amenity.slug === slug);
    return target?.images[imageIndex] ?? null;
}

export function resolveExperiencePageHeroImage(
    amenities: PropertyAmenityPublic[],
): ApartmentImageSet | null {
    const chosen = resolveAmenityImageByIndex(
        amenities,
        EXPERIENCE_PAGE_HERO.slug,
        EXPERIENCE_PAGE_HERO.imageIndex,
    );
    if (chosen) return chosen;

    for (const amenity of amenities) {
        if (amenity.images.length > 0) {
            return amenity.images[0] ?? null;
        }
    }

    return null;
}

export function resolveAboutPageImages(
    amenities: PropertyAmenityPublic[],
): AboutPageImages {
    return {
        story: resolveAmenityImageByIndex(
            amenities,
            ABOUT_PAGE_IMAGES.slug,
            ABOUT_PAGE_IMAGES.storyImageIndex,
        ),
        whyChooseUs: resolveAmenityImageByIndex(
            amenities,
            ABOUT_PAGE_IMAGES.slug,
            ABOUT_PAGE_IMAGES.whyChooseUsImageIndex,
        ),
    };
}

/** Amenities with at least one image — for homepage teaser cards. */
export async function getPublishedPropertyAmenitiesWithImages(): Promise<
    PropertyAmenityPublic[]
> {
    const amenities = await getPublishedPropertyAmenities();
    return amenities.filter((amenity) => amenity.images.length > 0);
}

export async function getPropertyGalleryImages(): Promise<
    PropertyGalleryImageItem[]
> {
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
