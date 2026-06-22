import { getGalleryImages } from "@/lib/data/getApartmentImages";
import { GalleryClient } from "@/components/GalleryClient";

export default async function GalleryPage() {
    const items = await getGalleryImages();

    return (
        <div className="pt-20 pb-24 bg-white min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 pt-12">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
                        Gallery
                    </h1>
                    <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
                        Explore our premium apartments through stunning visuals
                    </p>
                </div>

                <GalleryClient items={items} />
            </div>
        </div>
    );
}
