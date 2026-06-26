import Link from "next/link";
import { ArrowRight, Dumbbell, GlassWater, TreePalm, Waves } from "lucide-react";
import type { ApartmentImageSet } from "@/lib/images/types";
import type { PropertyAmenityPublic } from "@/lib/data/propertyAmenities";
import { PropertyAmenityGallery } from "@/components/PropertyAmenityGallery";
import { ResponsiveApartmentImage } from "@/components/ResponsiveApartmentImage";
import { Button } from "@/components/ui/button";

const AMENITY_ICONS: Record<string, typeof Waves> = {
    pool: Waves,
    gym: Dumbbell,
    bar: GlassWater,
    "outdoor-lounge": TreePalm,
};

type ExperiencePageContentProps = {
    amenities: PropertyAmenityPublic[];
    heroImage: ApartmentImageSet | null;
};

export function ExperiencePageContent({
    amenities,
    heroImage,
}: ExperiencePageContentProps) {
    return (
        <div className="pt-20 pb-12 sm:pb-16 md:pb-24 bg-white min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <section className="text-center mb-12 sm:mb-16 pt-8 sm:pt-12">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6 px-2">
                        The Lofty experience
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed px-4">
                        More than a room — unwind at the pool, stay active in the gym, sip at
                        the bar, and relax in our outdoor common areas.
                    </p>
                </section>

                {heroImage ? (
                    <div className="relative aspect-[21/9] max-h-[420px] rounded-2xl overflow-hidden mb-16 sm:mb-20">
                        <ResponsiveApartmentImage
                            image={heroImage}
                            alt={heroImage.altText ?? "Lofty property amenities"}
                            fill
                            variant="large"
                            className="object-cover"
                            sizes="100vw"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                ) : null}

                <div className="space-y-16 sm:space-y-24 max-w-5xl mx-auto">
                    {amenities.map((amenity, index) => {
                        const Icon = AMENITY_ICONS[amenity.slug] ?? TreePalm;
                        const reversed = index % 2 === 1;

                        return (
                            <section
                                key={amenity.id}
                                id={amenity.slug}
                                className="scroll-mt-28"
                            >
                                <div
                                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
                                        reversed ? "lg:[&>*:first-child]:order-2" : ""
                                    }`}
                                >
                                    <PropertyAmenityGallery
                                        images={amenity.images}
                                        name={amenity.name}
                                    />
                                    <div>
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#FA5C5C]/10 mb-4">
                                            <Icon className="h-6 w-6 text-[#FA5C5C]" />
                                        </div>
                                        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-3">
                                            {amenity.name}
                                        </h2>
                                        <p className="text-black/80 leading-relaxed mb-3">
                                            {amenity.shortDescription}
                                        </p>
                                        {amenity.description ? (
                                            <p className="text-black/70 leading-relaxed">
                                                {amenity.description}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </div>

                <section className="text-center mt-16 sm:mt-24 pt-12 border-t border-black/10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">
                        Ready to book your stay?
                    </h2>
                    <p className="text-black/70 mb-8 max-w-xl mx-auto">
                        Every suite includes access to our shared property amenities.
                    </p>
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full bg-[#FA5C5C] hover:bg-[#E84A4A] text-white min-h-[48px] px-8"
                    >
                        <Link href="/apartments">
                            Browse apartments
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </section>
            </div>
        </div>
    );
}
