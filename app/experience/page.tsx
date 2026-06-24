import { getPublishedPropertyAmenities } from "@/lib/data/propertyAmenities";
import { ExperiencePageContent } from "@/components/ExperiencePageContent";

export const metadata = {
    title: "Experience",
    description:
        "Explore shared amenities at Lofty Xphere Homes — pool, gym, bar, and outdoor lounges in Wuye, Abuja.",
};

export default async function ExperiencePage() {
    const amenities = await getPublishedPropertyAmenities();

    return <ExperiencePageContent amenities={amenities} />;
}
