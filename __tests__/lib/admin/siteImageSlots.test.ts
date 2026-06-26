import {
    SITE_IMAGE_SLOT_DEFINITIONS,
    getSiteImageSlotAssignments,
} from "@/lib/admin/siteImageSlots";

jest.mock("@/lib/db", () => ({
    prisma: {
        siteImageSlot: {
            upsert: jest.fn().mockResolvedValue({}),
            findMany: jest.fn().mockResolvedValue([
                {
                    key: "experience-hero",
                    label: "Experience page hero",
                    pagePath: "/experience",
                    sectionLabel: "Wide banner at top",
                    amenitySlug: "pool",
                    imageIndex: 2,
                    updatedAt: new Date("2026-06-26T12:00:00.000Z"),
                },
                {
                    key: "about-story",
                    label: "About page — Our Story",
                    pagePath: "/about",
                    sectionLabel: "First large photo (Our Story section)",
                    amenitySlug: "outdoor-lounge",
                    imageIndex: 7,
                    updatedAt: new Date("2026-06-26T12:00:00.000Z"),
                },
                {
                    key: "about-why-choose-us",
                    label: "About page — Why Choose Us",
                    pagePath: "/about",
                    sectionLabel: "Second large photo (Why Choose Us section)",
                    amenitySlug: "outdoor-lounge",
                    imageIndex: 8,
                    updatedAt: new Date("2026-06-26T12:00:00.000Z"),
                },
            ]),
        },
    },
}));

describe("site image slots", () => {
    it("exposes three managed slots with defaults", () => {
        expect(SITE_IMAGE_SLOT_DEFINITIONS).toHaveLength(3);
        expect(SITE_IMAGE_SLOT_DEFINITIONS.map((slot) => slot.key)).toEqual([
            "experience-hero",
            "about-story",
            "about-why-choose-us",
        ]);
    });

    it("loads slot assignments from the database", async () => {
        const assignments = await getSiteImageSlotAssignments();

        expect(assignments.experienceHero).toEqual({
            amenitySlug: "pool",
            imageIndex: 2,
        });
        expect(assignments.aboutStory).toEqual({
            amenitySlug: "outdoor-lounge",
            imageIndex: 7,
        });
        expect(assignments.aboutWhyChooseUs).toEqual({
            amenitySlug: "outdoor-lounge",
            imageIndex: 8,
        });
    });
});
