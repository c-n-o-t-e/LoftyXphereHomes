import {
    getPublishedPropertyAmenities,
    loadSiteImageSlotAssignments,
    resolveExperiencePageHeroImage,
} from "@/lib/data/propertyAmenities";
import { ExperiencePageContent } from "@/components/ExperiencePageContent";

export const metadata = {
    title: "Experience",
    description:
        "Explore shared amenities at Lofty Xphere Homes — pool, gym, bar, and outdoor lounges in Wuye, Abuja.",
};

export default async function ExperiencePage() {
    const [amenities, assignments] = await Promise.all([
        getPublishedPropertyAmenities(),
        loadSiteImageSlotAssignments(),
    ]);
    const heroImage = resolveExperiencePageHeroImage(
        amenities,
        assignments.experienceHero,
    );

    return (
        <ExperiencePageContent amenities={amenities} heroImage={heroImage} />
    );
}
