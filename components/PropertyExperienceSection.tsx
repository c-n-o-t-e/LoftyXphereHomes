"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ResponsiveApartmentImage } from "@/components/ResponsiveApartmentImage";
import type { PropertyAmenityPublic } from "@/lib/data/propertyAmenities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

const HOMEPAGE_AMENITY_LIMIT = 2;

type PropertyExperienceSectionProps = {
    amenities: PropertyAmenityPublic[];
};

function AmenityCard({
    amenity,
    priority = false,
}: {
    amenity: PropertyAmenityPublic;
    priority?: boolean;
}) {
    return (
        <Link href={`/experience#${amenity.slug}`} className="block group h-full">
            <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
                <div className="relative aspect-[4/3] bg-black/5 overflow-hidden">
                    {amenity.heroImage ? (
                        <ResponsiveApartmentImage
                            image={amenity.heroImage}
                            alt={amenity.heroImage.altText ?? amenity.name}
                            fill
                            variant="medium"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, 50vw"
                            priority={priority}
                        />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                        <h3 className="text-lg sm:text-xl font-bold text-white">
                            {amenity.name}
                        </h3>
                        <p className="text-sm text-white/85 mt-1 line-clamp-2">
                            {amenity.shortDescription}
                        </p>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

export default function PropertyExperienceSection({
    amenities,
}: PropertyExperienceSectionProps) {
    const featured = amenities.slice(0, HOMEPAGE_AMENITY_LIMIT);

    if (featured.length === 0) {
        return null;
    }

    return (
        <section className="py-12 sm:py-16 md:py-24 bg-black/[0.02]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8 sm:mb-12 md:mb-16"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 px-2">
                        Beyond your suite
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed px-4">
                        Shared outdoor spaces and facilities — included with every stay.
                    </p>
                </motion.div>

                {/* Mobile: swipe one card at a time */}
                <div className="sm:hidden mb-8">
                    <Carousel
                        opts={{ align: "start", loop: featured.length > 1 }}
                        className="w-full max-w-md mx-auto"
                    >
                        <CarouselContent className="-ml-3">
                            {featured.map((amenity, index) => (
                                <CarouselItem key={amenity.id} className="pl-3 basis-full">
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                    >
                                        <AmenityCard amenity={amenity} priority={index === 0} />
                                    </motion.div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        {featured.length > 1 ? (
                            <>
                                <CarouselPrevious className="left-0 -translate-x-1/2 border-black/10 bg-white shadow-md" />
                                <CarouselNext className="right-0 translate-x-1/2 border-black/10 bg-white shadow-md" />
                            </>
                        ) : null}
                    </Carousel>
                </div>

                {/* Tablet/desktop: two-up grid */}
                <div className="hidden sm:grid sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-8 sm:mb-12">
                    {featured.map((amenity, index) => (
                        <motion.div
                            key={amenity.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                        >
                            <AmenityCard amenity={amenity} priority={index === 0} />
                        </motion.div>
                    ))}
                </div>

                <div className="text-center">
                    <Button
                        asChild
                        size="lg"
                        className="rounded-full bg-[#FA5C5C] hover:bg-[#E84A4A] text-white min-h-[48px] px-6 sm:px-8"
                    >
                        <Link href="/experience" className="flex items-center justify-center">
                            Explore the property
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
