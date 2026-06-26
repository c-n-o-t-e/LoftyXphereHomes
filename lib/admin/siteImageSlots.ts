import { prisma } from "@/lib/db";
import { ensureDefaultPropertyAmenities } from "@/lib/admin/propertyAmenities";

export const SITE_IMAGE_SLOT_KEYS = [
    "experience-hero",
    "about-story",
    "about-why-choose-us",
] as const;

export type SiteImageSlotKey = (typeof SITE_IMAGE_SLOT_KEYS)[number];

export const SITE_IMAGE_SLOT_DEFINITIONS: ReadonlyArray<{
    key: SiteImageSlotKey;
    label: string;
    pagePath: string;
    sectionLabel: string;
    defaultAmenitySlug: string;
    defaultImageIndex: number;
}> = [
    {
        key: "experience-hero",
        label: "Experience page hero",
        pagePath: "/experience",
        sectionLabel: "Wide banner at top",
        defaultAmenitySlug: "outdoor-lounge",
        defaultImageIndex: 8,
    },
    {
        key: "about-story",
        label: "About page — Our Story",
        pagePath: "/about",
        sectionLabel: "First large photo (Our Story section)",
        defaultAmenitySlug: "outdoor-lounge",
        defaultImageIndex: 7,
    },
    {
        key: "about-why-choose-us",
        label: "About page — Why Choose Us",
        pagePath: "/about",
        sectionLabel: "Second large photo (Why Choose Us section)",
        defaultAmenitySlug: "outdoor-lounge",
        defaultImageIndex: 8,
    },
];

export type SiteImageSlotAssignment = {
    amenitySlug: string;
    imageIndex: number;
};

export type SiteImageSlotAssignments = {
    experienceHero: SiteImageSlotAssignment;
    aboutStory: SiteImageSlotAssignment;
    aboutWhyChooseUs: SiteImageSlotAssignment;
};

export type AdminSiteImageSlotRow = {
    key: SiteImageSlotKey;
    label: string;
    pagePath: string;
    sectionLabel: string;
    amenitySlug: string;
    imageIndex: number;
    photoNumber: number;
    amenityId: string | null;
    amenityName: string | null;
    imageCount: number;
    previewMediumUrl: string | null;
    previewAltText: string | null;
    isValid: boolean;
    updatedAt: string;
};

function assignmentFromKey(
    key: SiteImageSlotKey,
    amenitySlug: string,
    imageIndex: number,
): SiteImageSlotAssignment {
    return { amenitySlug, imageIndex };
}

export async function ensureDefaultSiteImageSlots() {
    for (const slot of SITE_IMAGE_SLOT_DEFINITIONS) {
        await prisma.siteImageSlot.upsert({
            where: { key: slot.key },
            create: {
                key: slot.key,
                label: slot.label,
                pagePath: slot.pagePath,
                sectionLabel: slot.sectionLabel,
                amenitySlug: slot.defaultAmenitySlug,
                imageIndex: slot.defaultImageIndex,
            },
            update: {},
        });
    }
}

export async function getSiteImageSlotAssignments(): Promise<SiteImageSlotAssignments> {
    await ensureDefaultSiteImageSlots();

    const rows = await prisma.siteImageSlot.findMany({
        where: { key: { in: [...SITE_IMAGE_SLOT_KEYS] } },
    });

    const byKey = new Map(rows.map((row) => [row.key, row]));

    const experience = byKey.get("experience-hero");
    const aboutStory = byKey.get("about-story");
    const aboutWhyChooseUs = byKey.get("about-why-choose-us");

    const experienceDef = SITE_IMAGE_SLOT_DEFINITIONS[0];
    const aboutStoryDef = SITE_IMAGE_SLOT_DEFINITIONS[1];
    const aboutWhyChooseUsDef = SITE_IMAGE_SLOT_DEFINITIONS[2];

    return {
        experienceHero: assignmentFromKey(
            "experience-hero",
            experience?.amenitySlug ?? experienceDef.defaultAmenitySlug,
            experience?.imageIndex ?? experienceDef.defaultImageIndex,
        ),
        aboutStory: assignmentFromKey(
            "about-story",
            aboutStory?.amenitySlug ?? aboutStoryDef.defaultAmenitySlug,
            aboutStory?.imageIndex ?? aboutStoryDef.defaultImageIndex,
        ),
        aboutWhyChooseUs: assignmentFromKey(
            "about-why-choose-us",
            aboutWhyChooseUs?.amenitySlug ?? aboutWhyChooseUsDef.defaultAmenitySlug,
            aboutWhyChooseUs?.imageIndex ?? aboutWhyChooseUsDef.defaultImageIndex,
        ),
    };
}

export async function listSiteImageSlotsForAdmin(): Promise<AdminSiteImageSlotRow[]> {
    await ensureDefaultPropertyAmenities();
    await ensureDefaultSiteImageSlots();

    const [slots, amenities] = await Promise.all([
        prisma.siteImageSlot.findMany({
            where: { key: { in: [...SITE_IMAGE_SLOT_KEYS] } },
            orderBy: { key: "asc" },
        }),
        prisma.propertyAmenity.findMany({
            orderBy: { displayOrder: "asc" },
            include: {
                images: { orderBy: { displayOrder: "asc" } },
            },
        }),
    ]);

    const amenityBySlug = new Map(amenities.map((row) => [row.slug, row]));

    return SITE_IMAGE_SLOT_DEFINITIONS.map((definition) => {
        const slot =
            slots.find((row) => row.key === definition.key) ??
            ({
                key: definition.key,
                label: definition.label,
                pagePath: definition.pagePath,
                sectionLabel: definition.sectionLabel,
                amenitySlug: definition.defaultAmenitySlug,
                imageIndex: definition.defaultImageIndex,
                updatedAt: new Date(),
            } as const);

        const amenity = amenityBySlug.get(slot.amenitySlug);
        const image = amenity?.images[slot.imageIndex];

        return {
            key: definition.key,
            label: slot.label,
            pagePath: slot.pagePath,
            sectionLabel: slot.sectionLabel,
            amenitySlug: slot.amenitySlug,
            imageIndex: slot.imageIndex,
            photoNumber: slot.imageIndex + 1,
            amenityId: amenity?.id ?? null,
            amenityName: amenity?.name ?? null,
            imageCount: amenity?.images.length ?? 0,
            previewMediumUrl: image?.mediumUrl ?? null,
            previewAltText: image?.altText ?? null,
            isValid: Boolean(image),
            updatedAt: slot.updatedAt.toISOString(),
        };
    });
}

export async function updateSiteImageSlot(args: {
    key: SiteImageSlotKey;
    amenitySlug: string;
    imageIndex: number;
}) {
    await ensureDefaultPropertyAmenities();
    await ensureDefaultSiteImageSlots();

    const definition = SITE_IMAGE_SLOT_DEFINITIONS.find(
        (slot) => slot.key === args.key,
    );
    if (!definition) {
        throw Object.assign(new Error("Site image slot not found"), { statusCode: 404 });
    }

    const amenitySlug = args.amenitySlug.trim();
    if (!amenitySlug) {
        throw Object.assign(new Error("Amenity is required"), { statusCode: 400 });
    }

    if (!Number.isInteger(args.imageIndex) || args.imageIndex < 0) {
        throw Object.assign(new Error("Photo number must be at least 1"), {
            statusCode: 400,
        });
    }

    const amenity = await prisma.propertyAmenity.findUnique({
        where: { slug: amenitySlug },
        select: { slug: true },
    });
    if (!amenity) {
        throw Object.assign(new Error("Property amenity not found"), { statusCode: 404 });
    }

    await prisma.siteImageSlot.update({
        where: { key: args.key },
        data: {
            amenitySlug,
            imageIndex: args.imageIndex,
        },
    });

    const rows = await listSiteImageSlotsForAdmin();
    const updated = rows.find((row) => row.key === args.key);
    if (!updated) {
        throw new Error("Updated slot missing after save");
    }
    return updated;
}
