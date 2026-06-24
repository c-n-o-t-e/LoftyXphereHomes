import { prisma } from "@/lib/db";

export const DEFAULT_PROPERTY_AMENITIES = [
    {
        id: "prop-amenity-pool",
        slug: "pool",
        name: "Pool",
        shortDescription: "A refreshing shared pool for guests to unwind.",
        description:
            "Take a dip in our shared pool — the perfect way to cool off after a day in Abuja.",
        displayOrder: 0,
    },
    {
        id: "prop-amenity-gym",
        slug: "gym",
        name: "Gym",
        shortDescription: "Stay on track with our on-site fitness space.",
        description:
            "A well-equipped gym so you can keep your routine while you travel.",
        displayOrder: 1,
    },
    {
        id: "prop-amenity-bar",
        slug: "bar",
        name: "Bar",
        shortDescription: "Unwind with drinks in a relaxed setting.",
        description:
            "Our bar lounge is ideal for evening drinks and casual conversation.",
        displayOrder: 2,
    },
    {
        id: "prop-amenity-outdoor",
        slug: "outdoor-lounge",
        name: "Outdoor & common areas",
        shortDescription: "Open-air lounges and landscaped common spaces.",
        description:
            "Stroll through outdoor lounges and intersection spaces designed for calm and connection.",
        displayOrder: 3,
    },
] as const;

export async function ensureDefaultPropertyAmenities() {
    for (const amenity of DEFAULT_PROPERTY_AMENITIES) {
        await prisma.propertyAmenity.upsert({
            where: { slug: amenity.slug },
            create: {
                id: amenity.id,
                slug: amenity.slug,
                name: amenity.name,
                shortDescription: amenity.shortDescription,
                description: amenity.description,
                displayOrder: amenity.displayOrder,
                isPublished: true,
            },
            update: {},
        });
    }
}

type PropertyAmenityRow = {
    id: string;
    slug: string;
    name: string;
    shortDescription: string;
    description: string | null;
    displayOrder: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
};

export function serializePropertyAmenity(row: PropertyAmenityRow) {
    return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        shortDescription: row.shortDescription,
        description: row.description,
        displayOrder: row.displayOrder,
        isPublished: row.isPublished,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
    };
}

export async function listPropertyAmenitiesForAdmin() {
    await ensureDefaultPropertyAmenities();
    const rows = await prisma.propertyAmenity.findMany({
        orderBy: { displayOrder: "asc" },
        include: {
            _count: { select: { images: true } },
        },
    });

    return rows.map((row) => ({
        ...serializePropertyAmenity(row),
        imageCount: row._count.images,
    }));
}

export async function getPropertyAmenityById(amenityId: string) {
    await ensureDefaultPropertyAmenities();
    const row = await prisma.propertyAmenity.findUnique({
        where: { id: amenityId },
    });
    return row ? serializePropertyAmenity(row) : null;
}

export async function updatePropertyAmenity(args: {
    amenityId: string;
    name?: string;
    shortDescription?: string;
    description?: string | null;
    isPublished?: boolean;
}) {
    const existing = await prisma.propertyAmenity.findUnique({
        where: { id: args.amenityId },
    });
    if (!existing) {
        throw Object.assign(new Error("Property amenity not found"), { statusCode: 404 });
    }

    const updated = await prisma.propertyAmenity.update({
        where: { id: args.amenityId },
        data: {
            name: args.name?.trim() || existing.name,
            shortDescription:
                args.shortDescription?.trim() || existing.shortDescription,
            description:
                args.description === undefined
                    ? existing.description
                    : args.description?.trim() || null,
            isPublished:
                args.isPublished === undefined
                    ? existing.isPublished
                    : args.isPublished,
        },
    });

    return serializePropertyAmenity(updated);
}
