import Hero from "@/components/Hero";
import ApartmentCard from "@/components/ApartmentCard";
import TrustSignals from "@/components/TrustSignals";
import TestimonialSlider from "@/components/TestimonialSlider";
import AmenitiesSection from "@/components/AmenitiesSection";
import LocationHighlight from "@/components/LocationHighlight";
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
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Apartments
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our handpicked selection of premium shortlet apartments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredApartments.map((apartment, index) => (
              <ApartmentCard key={apartment.id} apartment={apartment} index={index} />
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="rounded-full" variant="outline">
              <Link href="/apartments">
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
      <LocationHighlight />
      <TestimonialSlider />
      

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience Premium Shortlet Living?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Book your stay today and discover why guests choose LoftyXphereHomes
          </p>
          <Button asChild size="lg" className="rounded-full bg-white text-gray-900 hover:bg-gray-100">
            <Link href="/booking">
              Book Your Stay Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
