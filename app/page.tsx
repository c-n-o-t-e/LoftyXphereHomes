import Hero from "@/components/Hero";
import ApartmentCard from "@/components/ApartmentCard";
import TrustSignals from "@/components/TrustSignals";
import TestimonialSlider from "@/components/TestimonialSlider";
import AmenitiesSection from "@/components/AmenitiesSection";
import BlogSection from "@/components/BlogSection";
import { getFeaturedApartments } from "@/lib/data/apartments";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const featuredApartments = getFeaturedApartments(6);

  return (
    <>
      <Hero />
      
      {/* Featured Apartments */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 px-2">
              Featured Apartments
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed px-4">
              Discover our handpicked selection of premium shortlet apartments
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {featuredApartments.map((apartment, index) => (
              <ApartmentCard key={apartment.id} apartment={apartment} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="rounded-full border-black/20 hover:bg-[#FA5C5C] hover:text-white hover:border-[#FA5C5C] min-h-[48px] px-6 sm:px-8 text-sm sm:text-base" variant="outline">
              <Link href="/apartments" className="flex items-center justify-center">
                View All Apartments
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <TrustSignals />
      <AmenitiesSection />
      <BlogSection />
      <TestimonialSlider />
      

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-24 bg-white text-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-black px-2">
            Ready to Experience Premium Shortlet Living?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-black/70 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Book your stay today and discover why guests choose LoftyXphereHomes
          </p>
          <Button asChild size="lg" className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg bg-[#FA5C5C] text-white hover:bg-[#E84A4A] shadow-xl transition-all duration-300 min-h-[48px]">
            <Link href="/booking" className="flex items-center justify-center">
              Book Your Stay Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
