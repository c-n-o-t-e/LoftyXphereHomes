import { Apartment } from "../types";
import { ONE_BED_RACK_RATE_NGN, TWO_BED_RACK_RATE_NGN } from "../constants";

const LOCATION = { city: "Abuja", area: "Wuye" } as const;

/** In-suite amenities for 1-bedroom units (apartment detail “In your suite” section). */
const ONE_BED_AMENITIES = [
    "PS5 gaming console",
    "Starlink Wi-Fi",
    "Shared lounge",
    "On-site restaurant",
    "Keyless entry with passcode door & entry camera",
    "Daily cleaning",
    "Cozy bedroom",
    "Swimming pool",
    "Private balcony",
    "Washing machine",
    "En-suite bathroom",
    "Fully equipped kitchen",
    "Smart TV (Netflix & DStv)",
    "Stylishly furnished living room",
    "2 air conditioners on solar & inverter",
    "Excellent customer service & support",
    "Serene, secure neighborhood",
    "24/7 electricity (solar, inverter & generator)",
] as const;

/** In-suite amenities for 2-bedroom units (apartment detail “In your suite” section). */
const TWO_BED_AMENITIES = [
    "PS5 gaming console",
    "Starlink Wi-Fi",
    "Shared lounge",
    "On-site restaurant",
    "Keyless entry with passcode door & entry camera",
    "Daily cleaning",
    "Cozy bedrooms",
    "Swimming pool",
    "Private balconies",
    "Washing machine",
    "En-suite bathrooms",
    "Fully equipped kitchen",
    "Smart TV (Netflix & DStv)",
    "Stylishly furnished living room",
    "4 air conditioners on solar & inverter",
    "Excellent customer service & support",
    "Serene, secure neighborhood",
    "24/7 electricity (solar, inverter & generator)",
] as const;

const SHARED_HOUSE_RULES = [
    "No smoking indoors",
    "No parties without approval",
    "Valid ID required",
    "Respect neighbors (noise control after 10PM)",
] as const;

const ONE_BED_PRICE = ONE_BED_RACK_RATE_NGN;
const TWO_BED_PRICE = TWO_BED_RACK_RATE_NGN;

/** Canonical IDs shown first on the site and in featured sections. */
export const FEATURED_APARTMENT_IDS = ["meridian-suite", "lumen-suite"] as const;

/** Maps legacy `lofty-*` IDs to canonical IDs for URLs, bookings, and admin tools. */
export const LEGACY_APARTMENT_IDS: Record<string, string> = {
    "lofty-horizon-suite": "horizon-suite",
    "lofty-skyline-suite": "skyline-suite",
    "lofty-meridian-suite": "meridian-suite",
    "lofty-lumen-suite": "lumen-suite",
    "lofty-apex-suite": "apex-suite",
    "lofty-cascade-suite": "cascade-suite",
    "lofty-solstice-suite": "solstice-suite",
    "lofty-atrium-suite": "atrium-suite",
    "lofty-ember-suite": "ember-suite",
};

export const apartments: Apartment[] = [
    {
        id: "meridian-suite",
        name: "Meridian Suite",
        shortDescription:
            "Premium 2-bedroom suite with modern finishes and a calm, residential feel in Wuye.",
        location: LOCATION,
        pricePerNight: TWO_BED_PRICE,
        images: [],
        amenities: [...TWO_BED_AMENITIES],
        houseRules: [...SHARED_HOUSE_RULES],
        capacity: 4,
        beds: 2,
        baths: 2,
        rating: 4.8,
        reviews: 31,
        status: "active",
        bookingUrl: process.env.NEXT_PUBLIC_BOOKING_MERIDIAN_SUITE,
    },
    {
        id: "lumen-suite",
        name: "Lumen Suite",
        shortDescription:
            "Bright 2-bedroom apartment with airy living spaces and everything you need for a comfortable stay.",
        location: LOCATION,
        pricePerNight: TWO_BED_PRICE,
        images: [],
        amenities: [...TWO_BED_AMENITIES],
        houseRules: [...SHARED_HOUSE_RULES],
        capacity: 4,
        beds: 2,
        baths: 2,
        rating: 4.8,
        reviews: 27,
        status: "active",
        bookingUrl: process.env.NEXT_PUBLIC_BOOKING_LUMEN_SUITE,
    },
    {
        id: "horizon-suite",
        name: "Horizon Suite",
        shortDescription:
            "Elegant 1-bedroom suite in Wuye — perfect for couples, solo travelers, and business stays.",
        location: LOCATION,
        pricePerNight: ONE_BED_PRICE,
        images: [],
        amenities: [...ONE_BED_AMENITIES],
        houseRules: [...SHARED_HOUSE_RULES],
        capacity: 2,
        beds: 1,
        baths: 1,
        rating: 4.9,
        reviews: 42,
        status: "active",
        bookingUrl: process.env.NEXT_PUBLIC_BOOKING_HORIZON_SUITE,
    },
    {
        id: "skyline-suite",
        name: "Skyline Suite",
        shortDescription:
            "Spacious 2-bedroom apartment with skyline views, ideal for families and small groups.",
        location: LOCATION,
        pricePerNight: TWO_BED_PRICE,
        images: [],
        amenities: [...TWO_BED_AMENITIES],
        houseRules: [...SHARED_HOUSE_RULES],
        capacity: 4,
        beds: 2,
        baths: 2,
        rating: 4.9,
        reviews: 38,
        status: "active",
        bookingUrl: process.env.NEXT_PUBLIC_BOOKING_SKYLINE_SUITE,
    },
    {
        id: "apex-suite",
        name: "Apex Suite",
        shortDescription:
            "An elevated 2-bedroom suite — finishing touches underway. Join the waitlist for launch updates.",
        location: LOCATION,
        pricePerNight: TWO_BED_PRICE,
        images: [],
        amenities: [...TWO_BED_AMENITIES],
        houseRules: [...SHARED_HOUSE_RULES],
        capacity: 4,
        beds: 2,
        baths: 2,
        rating: 0,
        reviews: 0,
        status: "coming_soon",
    },
    {
        id: "cascade-suite",
        name: "Cascade Suite",
        shortDescription:
            "A flowing 2-bedroom layout designed for comfort — currently being prepared for guests.",
        location: LOCATION,
        pricePerNight: TWO_BED_PRICE,
        images: [],
        amenities: [...TWO_BED_AMENITIES],
        houseRules: [...SHARED_HOUSE_RULES],
        capacity: 4,
        beds: 2,
        baths: 2,
        rating: 0,
        reviews: 0,
        status: "coming_soon",
    },
    {
        id: "solstice-suite",
        name: "Solstice Suite",
        shortDescription:
            "Intimate 1-bedroom suite coming soon — perfect for short business trips and weekend escapes.",
        location: LOCATION,
        pricePerNight: ONE_BED_PRICE,
        images: [],
        amenities: [...ONE_BED_AMENITIES],
        houseRules: [...SHARED_HOUSE_RULES],
        capacity: 2,
        beds: 1,
        baths: 1,
        rating: 0,
        reviews: 0,
        status: "coming_soon",
    },
    {
        id: "atrium-suite",
        name: "Atrium Suite",
        shortDescription:
            "Light-filled 2-bedroom apartment with an open feel — launching soon at Lofty Xphere Homes.",
        location: LOCATION,
        pricePerNight: TWO_BED_PRICE,
        images: [],
        amenities: [...TWO_BED_AMENITIES],
        houseRules: [...SHARED_HOUSE_RULES],
        capacity: 4,
        beds: 2,
        baths: 2,
        rating: 0,
        reviews: 0,
        status: "coming_soon",
    },
    {
        id: "ember-suite",
        name: "Ember Suite",
        shortDescription:
            "Warm, welcoming 2-bedroom suite — currently under fit-out. Register interest to be notified first.",
        location: LOCATION,
        pricePerNight: TWO_BED_PRICE,
        images: [],
        amenities: [...TWO_BED_AMENITIES],
        houseRules: [...SHARED_HOUSE_RULES],
        capacity: 4,
        beds: 2,
        baths: 2,
        rating: 0,
        reviews: 0,
        status: "coming_soon",
    },
];

export function normalizeApartmentId(id: string): string {
    return LEGACY_APARTMENT_IDS[id] ?? id;
}

/** Canonical and legacy IDs that may exist in the database or storage paths. */
export function getApartmentIdLookupIds(id: string): string[] {
    const canonical = normalizeApartmentId(id);
    const legacy = Object.entries(LEGACY_APARTMENT_IDS).find(
        ([, mappedId]) => mappedId === canonical,
    )?.[0];

    return legacy ? [canonical, legacy] : [canonical];
}

export function expandApartmentIdsForLookup(ids: string[]): string[] {
    return [...new Set(ids.flatMap((id) => getApartmentIdLookupIds(id)))];
}

export function getApartmentById(id: string): Apartment | undefined {
    const normalizedId = normalizeApartmentId(id);
    return apartments.find((apt) => apt.id === normalizedId);
}

export function isApartmentBookable(apartment: Apartment): boolean {
    return apartment.status === "active";
}

export function getActiveApartments(): Apartment[] {
    return apartments.filter((apt) => apt.status === "active");
}

export function getComingSoonApartments(): Apartment[] {
    return apartments.filter((apt) => apt.status === "coming_soon");
}

export function getFeaturedApartments(limit: number = 2): Apartment[] {
    const activeById = new Map(getActiveApartments().map((apt) => [apt.id, apt]));
    const featured = FEATURED_APARTMENT_IDS.map((id) => activeById.get(id)).filter(
        (apt): apt is Apartment => apt !== undefined,
    );

    return featured.slice(0, limit);
}
