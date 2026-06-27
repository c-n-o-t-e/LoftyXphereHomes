"use client";

import { useState } from "react";
import Link from "next/link";
import { ResponsiveApartmentImage } from "@/components/ResponsiveApartmentImage";
import { ApartmentImagePlaceholder } from "@/components/ApartmentImagePlaceholder";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Users, Bed, Bath, Play } from "lucide-react";
import { Apartment } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { ApartmentImageSet } from "@/lib/images/types";

interface ApartmentCardProps {
  apartment: Apartment;
  index?: number;
  imageSets?: ApartmentImageSet[];
  imagesLoading?: boolean;
  hasVideoTour?: boolean;
  /** Query string (without leading ?) appended to detail links, e.g. checkIn & checkOut. */
  detailSearchParams?: string;
}

export default function ApartmentCard({
  apartment,
  index = 0,
  imageSets,
  imagesLoading = false,
  hasVideoTour = false,
  detailSearchParams,
}: ApartmentCardProps) {
  const comingSoon = apartment.status === "coming_soon";
  const detailHref = detailSearchParams
    ? `/apartments/${apartment.id}?${detailSearchParams}`
    : `/apartments/${apartment.id}`;
  const [imageIndex, setImageIndex] = useState(0);
  const sets = imageSets ?? [];
  const hasImages = sets.length > 0;
  const hasMultipleImages = sets.length > 1;

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev === 0 ? sets.length - 1 : prev - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImageIndex((prev) => (prev === sets.length - 1 ? 0 : prev + 1));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className={`overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group ${comingSoon ? "opacity-90" : ""}`}>
        <Link href={detailHref} className="block">
          <div className={`relative h-64 overflow-hidden bg-black/5 ${comingSoon ? "grayscale-[35%]" : ""}`}>
            {imagesLoading ? (
              <ApartmentImagePlaceholder loading className="absolute inset-0" />
            ) : hasImages ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={imageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    <ResponsiveApartmentImage
                      image={sets[imageIndex]!}
                      alt={`${apartment.name} - Image ${imageIndex + 1}`}
                      fill
                      variant="medium"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </motion.div>
                </AnimatePresence>

                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5 text-black" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity focus:opacity-100 focus:outline-none"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5 text-black" />
                    </button>
                  </>
                )}

                {hasMultipleImages && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                    {sets.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setImageIndex(i);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === imageIndex ? "bg-white w-4" : "bg-white/60 hover:bg-white/80"
                        }`}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <ApartmentImagePlaceholder className="absolute inset-0" />
            )}

            {comingSoon ? (
              <div className="absolute top-4 left-4 z-10 rounded-full bg-black/75 px-3 py-1 text-xs font-semibold text-white">
                Coming soon
              </div>
            ) : null}

            {hasVideoTour && !comingSoon ? (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
                <Play className="h-3.5 w-3.5" aria-hidden />
                Tour
              </div>
            ) : null}
          </div>
        </Link>
        <CardContent className="p-6">
          <Link href={detailHref}>
            <h3 className="text-xl font-bold text-black mb-2 group-hover:text-[#FA5C5C] transition-colors">
              {apartment.name}
            </h3>
            <p className="text-black/70 text-sm mb-4 line-clamp-2">
              {apartment.shortDescription}
            </p>
          </Link>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-black/70">
              <MapPin className="h-4 w-4 mr-2 text-[#FA5C5C]" />
              {apartment.location.area}, {apartment.location.city}
            </div>

            <div className="flex items-center space-x-4 text-sm text-black/70">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {apartment.capacity}
              </div>
              <div className="flex items-center">
                <Bed className="h-4 w-4 mr-1" />
                {apartment.beds}
              </div>
              <div className="flex items-center">
                <Bath className="h-4 w-4 mr-1" />
                {apartment.baths}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-3 border-t border-black/10 gap-3">
              {comingSoon ? (
                <p className="text-sm text-black/60">
                  Launching soon — view details or contact us to register interest.
                </p>
              ) : (
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-black">
                    {formatPrice(apartment.pricePerNight)}
                  </p>
                  <p className="text-xs text-black/60">per night</p>
                </div>
              )}
              <Button
                asChild
                variant={comingSoon ? "outline" : "default"}
                className={`rounded-full w-full sm:w-auto min-h-[44px] px-6 text-sm sm:text-base ${
                  comingSoon
                    ? "border-black/20 text-black hover:bg-black/5"
                    : "bg-[#FA5C5C] hover:bg-[#E84A4A] text-white"
                }`}
              >
                <Link href={detailHref} className="w-full sm:w-auto text-center">
                  {comingSoon ? "View details" : "View Details"}
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
