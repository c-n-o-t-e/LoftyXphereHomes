import { Suspense } from "react";
import Hero from "@/components/Hero";
import TrustSignals from "@/components/TrustSignals";
import TestimonialSlider from "@/components/TestimonialSlider";
import AmenitiesSection from "@/components/AmenitiesSection";
import BlogSection from "@/components/BlogSection";
import { FeaturedApartmentsSection } from "@/components/home/FeaturedApartmentsSection";
import { FeaturedApartmentsSkeleton } from "@/components/home/FeaturedApartmentsSkeleton";
import { PropertyExperienceSectionLoader } from "@/components/home/PropertyExperienceSectionLoader";
import { getPublicHeroVideo } from "@/lib/admin/heroVideo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const heroVideo = await getPublicHeroVideo();

  return (
    <>
      {heroVideo?.mobileMp4Url ? (
        <link
          rel="preload"
          as="video"
          href={heroVideo.mobileMp4Url}
          media="(max-width: 768px)"
        />
      ) : null}
      {heroVideo?.desktopMp4Url ? (
        <link
          rel="preload"
          as="video"
          href={heroVideo.desktopMp4Url}
          media="(min-width: 769px)"
        />
      ) : null}

      <Hero heroVideo={heroVideo} />

      <Suspense fallback={<FeaturedApartmentsSkeleton />}>
        <FeaturedApartmentsSection />
      </Suspense>

      <TrustSignals />

      <Suspense fallback={null}>
        <PropertyExperienceSectionLoader />
      </Suspense>

      <AmenitiesSection />
      <BlogSection />
      <TestimonialSlider />

      <section className="py-12 sm:py-16 md:py-24 bg-white text-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-black px-2">
            Ready to Experience Premium Shortlet Living?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-black/70 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
            Book your stay today and discover why guests choose LoftyXphereHomes
          </p>
          <Button
            asChild
            size="lg"
            className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg bg-[#FA5C5C] text-white hover:bg-[#E84A4A] shadow-xl transition-all duration-300 min-h-[48px]"
          >
            <Link href="/apartments" className="flex items-center justify-center">
              Browse Apartments
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
