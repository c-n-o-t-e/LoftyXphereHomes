import {
    getPublishedPropertyAmenities,
    resolveAboutPageImages,
} from "@/lib/data/propertyAmenities";
import { AboutPageContent } from "@/components/AboutPageContent";

export default async function AboutPage() {
    const amenities = await getPublishedPropertyAmenities();
    const images = resolveAboutPageImages(amenities);

    return <AboutPageContent images={images} />;
}
