import PropertyExperienceSection from "@/components/PropertyExperienceSection";
import { getPublishedPropertyAmenitiesWithImages } from "@/lib/data/propertyAmenities";

export async function PropertyExperienceSectionLoader() {
    const propertyAmenities = await getPublishedPropertyAmenitiesWithImages();
    return <PropertyExperienceSection amenities={propertyAmenities} />;
}
