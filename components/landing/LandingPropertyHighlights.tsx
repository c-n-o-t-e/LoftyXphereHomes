"use client";

import { motion } from "framer-motion";
import { ResponsiveApartmentImage } from "@/components/ResponsiveApartmentImage";
import type { PropertyAmenityPublic } from "@/lib/data/propertyAmenities";

type LandingPropertyHighlightsProps = {
  amenities: PropertyAmenityPublic[];
};

function HighlightCard({
  amenity,
  priority = false,
}: {
  amenity: PropertyAmenityPublic;
  priority?: boolean;
}) {
  if (!amenity.heroImage) return null;

  return (
    <div className="group relative h-full overflow-hidden rounded-xl bg-black/5 shadow-sm border border-black/10">
      <div className="relative aspect-[4/3] sm:aspect-[3/2] overflow-hidden">
        <ResponsiveApartmentImage
          image={amenity.heroImage}
          alt={amenity.heroImage.altText ?? amenity.name}
          fill
          variant="medium"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <p className="text-sm sm:text-base font-semibold text-white leading-tight">
            {amenity.name}
          </p>
          <p className="text-xs text-white/85 mt-0.5 line-clamp-2">
            {amenity.shortDescription}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact property amenity strip for the /book landing page — visual reassurance
 * without pulling users away from suite selection.
 */
export function LandingPropertyHighlights({
  amenities,
}: LandingPropertyHighlightsProps) {
  const withImages = amenities.filter((a) => a.heroImage);
  if (withImages.length === 0) return null;

  return (
    <section
      className="mt-12 sm:mt-16 pt-10 sm:pt-12 border-t border-black/10"
      aria-label="Property amenities included with your stay"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.45 }}
        className="text-center mb-6 sm:mb-8 px-2"
      >
        <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">
          More than a room — included with your stay
        </h2>
        <p className="text-sm sm:text-base text-black/65 max-w-xl mx-auto">
          Pool, gym, breakfast, and shared spaces — yours throughout your visit.
        </p>
      </motion.div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto"
        role="list"
      >
        {withImages.map((amenity, index) => (
          <motion.div
            key={amenity.id}
            role="listitem"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: index * 0.04 }}
            className="w-full"
          >
            <HighlightCard amenity={amenity} priority={index < 3} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
