import type { Metadata } from "next";
import { getGalleryImages } from "@/lib/data/getApartmentImages";
import { getPropertyGalleryImages } from "@/lib/data/propertyAmenities";
import { GalleryClient } from "@/components/GalleryClient";
import { SITE_NAME } from "@/lib/constants";
import { LOCATION_SEO } from "@/lib/content/seoCopy";

export const metadata: Metadata = {
  title: "Gallery",
  description: `Browse photos of luxury serviced apartment interiors and shared amenities at ${SITE_NAME} in ${LOCATION_SEO}.`,
};

export default async function GalleryPage() {
    const [suiteItems, propertyItems] = await Promise.all([
        getGalleryImages(),
        getPropertyGalleryImages(),
    ]);

    return (
        <div className="pt-20 pb-24 bg-white min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 pt-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
                        Gallery
                    </h1>
                    <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
                        Explore our luxury serviced apartment suites and shared property spaces in {LOCATION_SEO}
                    </p>
                </div>

                <GalleryClient suiteItems={suiteItems} propertyItems={propertyItems} />
            </div>
        </div>
    );
}
