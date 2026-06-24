import { getGalleryImages } from "@/lib/data/getApartmentImages";
import { getPropertyGalleryImages } from "@/lib/data/propertyAmenities";
import { GalleryClient } from "@/components/GalleryClient";

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
                        Browse suite interiors and shared property spaces
                    </p>
                </div>

                <GalleryClient suiteItems={suiteItems} propertyItems={propertyItems} />
            </div>
        </div>
    );
}
