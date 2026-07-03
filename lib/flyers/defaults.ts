import { getApartmentById } from "@/lib/data/apartments";
import { prisma } from "@/lib/db";
import {
    createEmptyFlyerImages,
    DEFAULT_FLYER_CONTACT,
    DEFAULT_FLYER_DISCOVERY_LINE,
    DEFAULT_FLYER_LOGO,
    DEFAULT_FLYER_THEME,
    FLYER_PERFECT_FOR_OPTIONS,
    getDefaultGridImageOrder,
    resolveDefaultWebsiteUrl,
} from "@/lib/flyers/constants";
import {
    getAmenityKeyForLabel,
    getDefaultFlyerAmenityKeys,
} from "@/lib/amenities/suiteAmenities";
import type { FlyerImageSlotKey, FlyerPayload } from "@/lib/flyers/types";

function mapApartmentAmenities(apartmentId: string): string[] {
    const apartment = getApartmentById(apartmentId);
    if (!apartment) {
        return getDefaultFlyerAmenityKeys();
    }

    const keys = apartment.amenities
        .map((label) => getAmenityKeyForLabel(label))
        .filter((key): key is string => Boolean(key));

    return keys.length > 0 ? keys : getDefaultFlyerAmenityKeys();
}

export function createDefaultFlyerPayload(
    overrides: Partial<FlyerPayload> = {},
): FlyerPayload {
    return {
        apartmentId: null,
        apartmentName: "",
        headline: "LUXURY SHORTLET APARTMENTS IN ABUJA",
        subheadline: "Experience Comfort.\nExperience Luxury.\nFeel At Home.",
        ctaText: "BOOK TODAY",
        discoveryLine: DEFAULT_FLYER_DISCOVERY_LINE,
        bodyCopy:
            "Premium serviced apartments in Abuja — designed for comfort, security, and effortless stays.",
        location: "Abuja, Nigeria",
        contact: { ...DEFAULT_FLYER_CONTACT },
        qr: { destinationType: "website" },
        amenities: getDefaultFlyerAmenityKeys(),
        perfectFor: [...FLYER_PERFECT_FOR_OPTIONS],
        theme: { ...DEFAULT_FLYER_THEME },
        logo: { ...DEFAULT_FLYER_LOGO },
        images: createEmptyFlyerImages(),
        gridImageOrder: getDefaultGridImageOrder(),
        ...overrides,
    };
}

export async function buildFlyerPayloadFromApartment(
    apartmentId: string,
): Promise<Partial<FlyerPayload>> {
    const apartment = getApartmentById(apartmentId);
    if (!apartment) {
        throw Object.assign(new Error("Apartment not found"), { statusCode: 404 });
    }

    const images = await prisma.apartmentImage.findMany({
        where: { apartmentId },
        orderBy: { displayOrder: "asc" },
        take: 8,
    });

    const slotUrls: Partial<Record<FlyerImageSlotKey, string>> = {};
    if (images[0]) slotUrls.hero = images[0].largeUrl;
    if (images[1]) slotUrls.livingRoom = images[1].largeUrl;
    if (images[2]) slotUrls.bedroom = images[2].largeUrl;
    if (images[3]) slotUrls.kitchen = images[3].largeUrl;
    if (images[4]) slotUrls.bathroom = images[4].largeUrl;
    if (images[5]) slotUrls.pool = images[5].largeUrl;
    if (images[6]) slotUrls.gym = images[6].largeUrl;
    if (images[7]) slotUrls.exterior = images[7].largeUrl;

    const baseImages = createEmptyFlyerImages();
    for (const [key, url] of Object.entries(slotUrls) as [FlyerImageSlotKey, string][]) {
        baseImages[key] = { ...baseImages[key], url };
    }

    const bookingUrl =
        apartment.bookingUrl?.trim() ||
        `${resolveDefaultWebsiteUrl()}/apartments/${apartment.id}`;

    return {
        apartmentId: apartment.id,
        apartmentName: apartment.name,
        headline: "LUXURY SHORTLET APARTMENTS IN ABUJA",
        subheadline: `${apartment.name}\nExperience Comfort. Experience Luxury.\nFeel At Home.`,
        bodyCopy: apartment.shortDescription,
        location: `${apartment.location.city}, Nigeria`,
        amenities: mapApartmentAmenities(apartment.id),
        images: baseImages,
        qr: {
            destinationType: "apartment",
            customUrl: bookingUrl,
        },
    };
}

export function mergeFlyerPayload(
    current: FlyerPayload,
    patch: Partial<FlyerPayload>,
): FlyerPayload {
    return {
        ...current,
        ...patch,
        contact: patch.contact ? { ...current.contact, ...patch.contact } : current.contact,
        qr: patch.qr ? { ...current.qr, ...patch.qr } : current.qr,
        theme: patch.theme ? { ...current.theme, ...patch.theme } : current.theme,
        logo: patch.logo ? { ...current.logo, ...patch.logo } : current.logo,
        images: patch.images
            ? { ...current.images, ...patch.images }
            : current.images,
        amenities: patch.amenities ?? current.amenities,
        perfectFor: patch.perfectFor ?? current.perfectFor,
        gridImageOrder: patch.gridImageOrder ?? current.gridImageOrder,
    };
}
