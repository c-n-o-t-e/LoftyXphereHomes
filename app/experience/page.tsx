import {
    getPublishedPropertyAmenities,
    loadSiteImageSlotAssignments,
    resolveExperiencePageHeroImage,
} from "@/lib/data/propertyAmenities";
import { ExperiencePageContent } from "@/components/ExperiencePageContent";
import { SITE_NAME } from "@/lib/constants";
import { LOCATION_SEO } from "@/lib/content/seoCopy";

export const metadata = {
    title: "Experience",
    description: `Explore shared amenities at ${SITE_NAME} — pool, gym, bar, and outdoor lounges included with every luxury serviced apartment in ${LOCATION_SEO}.`,
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
