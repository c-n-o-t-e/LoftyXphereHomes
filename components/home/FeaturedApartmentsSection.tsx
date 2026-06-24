import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ApartmentCard from "@/components/ApartmentCard";
import { getFeaturedApartments } from "@/lib/data/apartments";
import { getAllApartmentImageSetsMap } from "@/lib/data/getApartmentImages";
import { Button } from "@/components/ui/button";

export async function FeaturedApartmentsSection() {
    const featuredApartments = getFeaturedApartments(2);
    const imageSetsByApartment = await getAllApartmentImageSetsMap();

    return (
        <section className="py-12 sm:py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10 sm:mb-12 md:mb-16">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 px-2">
                        Featured Apartments
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed px-4">
                        Premium suites in Wuye, Abuja — book your stay at Lofty Xphere Homes
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12 max-w-5xl mx-auto">
                    {featuredApartments.map((apartment, index) => (
                        <ApartmentCard
                            key={apartment.id}
                            apartment={apartment}
                            index={index}
                            imageSets={imageSetsByApartment[apartment.id]}
                        />
                    ))}
                </div>

                <div className="text-center">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full border-black/20 hover:bg-[#FA5C5C] hover:text-white hover:border-[#FA5C5C] min-h-[48px] px-6 sm:px-8 text-sm sm:text-base"
                        variant="outline"
                    >
                        <Link href="/apartments" className="flex items-center justify-center">
                            View All Apartments
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
