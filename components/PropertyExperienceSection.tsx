"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ResponsiveApartmentImage } from "@/components/ResponsiveApartmentImage";
import type { PropertyAmenityPublic } from "@/lib/data/propertyAmenities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type PropertyExperienceSectionProps = {
    amenities: PropertyAmenityPublic[];
};

export default function PropertyExperienceSection({
    amenities,
}: PropertyExperienceSectionProps) {
    if (amenities.length === 0) {
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
                    className="text-center mb-10 sm:mb-12 md:mb-16"
                >
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-4 sm:mb-6 px-2">
                        Beyond your suite
                    </h2>
                    <p className="text-base sm:text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed px-4">
                        Shared pools, fitness, bar, and outdoor lounges — included with every
                        stay at Lofty Xphere Homes.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto mb-8 sm:mb-12">
                    {amenities.map((amenity, index) => (
                        <motion.div
                            key={amenity.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                        >
                            <Link href={`/experience#${amenity.slug}`} className="block group">
                                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                                    <div className="relative aspect-[4/3] bg-black/5 overflow-hidden">
                                        {amenity.heroImage ? (
                                            <ResponsiveApartmentImage
                                                image={amenity.heroImage}
                                                alt={
                                                    amenity.heroImage.altText ??
                                                    amenity.name
                                                }
                                                fill
                                                variant="medium"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 50vw"
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
