import { Apartment } from "../types";

const LOCATION = { city: "Abuja", area: "Wuye" } as const;

const SHARED_AMENITIES = [
    "24/7 Power",
    "High-speed Wi-Fi",
    "Air Conditioning",
    "Fully equipped kitchen",
    "Secure parking",
    "Workspace desk",
    "Netflix/YouTube enabled TV",
    "Security personnel",
    "Fresh towels & toiletries",
] as const;

const TWO_BED_AMENITIES = [
    ...SHARED_AMENITIES,
    "Balcony with city view",
    "Washing machine",
] as const;

const SHARED_HOUSE_RULES = [
    "No smoking indoors",
    "No parties without approval",
    "Valid ID required",
    "Respect neighbors (noise control after 10PM)",
] as const;

const ONE_BED_PRICE = 120_000;
const TWO_BED_PRICE = 250_000;

export const apartments: Apartment[] = [
    {
        id: "lofty-horizon-suite",
        name: "The Horizon Suite",
        shortDescription:
            "Elegant 1-bedroom suite in Wuye — perfect for couples, solo travelers, and business stays.",
        location: LOCATION,
        pricePerNight: ONE_BED_PRICE,
        images: [],
        amenities: [...SHARED_AMENITIES],
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
        id: "lofty-skyline-suite",
        name: "The Skyline Suite",
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
        id: "lofty-meridian-suite",
        name: "The Meridian Suite",
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
        id: "lofty-lumen-suite",
        name: "The Lumen Suite",
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
        id: "lofty-apex-suite",
        name: "The Apex Suite",
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
        id: "lofty-cascade-suite",
        name: "The Cascade Suite",
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
        id: "lofty-solstice-suite",
        name: "The Solstice Suite",
        shortDescription:
            "Intimate 1-bedroom suite coming soon — perfect for short business trips and weekend escapes.",
        location: LOCATION,
        pricePerNight: ONE_BED_PRICE,
        images: [],
        amenities: [...SHARED_AMENITIES],
        houseRules: [...SHARED_HOUSE_RULES],
        capacity: 2,
        beds: 1,
        baths: 1,
        rating: 0,
        reviews: 0,
        status: "coming_soon",
    },
    {
        id: "lofty-atrium-suite",
        name: "The Atrium Suite",
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
        id: "lofty-ember-suite",
        name: "The Ember Suite",
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

export function getApartmentById(id: string): Apartment | undefined {
    return apartments.find((apt) => apt.id === id);
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
    return getActiveApartments()
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
}
