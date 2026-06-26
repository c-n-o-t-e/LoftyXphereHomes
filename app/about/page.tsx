import {
    getPublishedPropertyAmenities,
    loadSiteImageSlotAssignments,
    resolveAboutPageImages,
} from "@/lib/data/propertyAmenities";
import { AboutPageContent } from "@/components/AboutPageContent";

export default async function AboutPage() {
    const [amenities, assignments] = await Promise.all([
        getPublishedPropertyAmenities(),
        loadSiteImageSlotAssignments(),
    ]);
    const images = resolveAboutPageImages(amenities, {
        aboutStory: assignments.aboutStory,
        aboutWhyChooseUs: assignments.aboutWhyChooseUs,
    });

    return <AboutPageContent images={images} />;
}
