"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryImageItem } from "@/lib/data/getApartmentImages";
import type { PropertyGalleryImageItem } from "@/lib/data/propertyAmenities";
import { ResponsiveApartmentImage } from "@/components/ResponsiveApartmentImage";

type GalleryTab = "suites" | "property";

type GalleryDisplayItem = {
    key: string;
    image: GalleryImageItem["image"];
    label: string;
};

interface GalleryClientProps {
    suiteItems: GalleryImageItem[];
    propertyItems: PropertyGalleryImageItem[];
}

function toDisplayItems(
    tab: GalleryTab,
    suiteItems: GalleryImageItem[],
    propertyItems: PropertyGalleryImageItem[],
): GalleryDisplayItem[] {
    if (tab === "property") {
        return propertyItems.map((item, index) => ({
            key: `${item.amenityId}-${index}`,
            image: item.image,
            label: item.amenity,
        }));
    }
    return suiteItems.map((item, index) => ({
        key: `${item.apartmentId}-${index}`,
        image: item.image,
        label: item.apartment,
    }));
}

export function GalleryClient({ suiteItems, propertyItems }: GalleryClientProps) {
    const [activeTab, setActiveTab] = useState<GalleryTab>("suites");
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const items = toDisplayItems(activeTab, suiteItems, propertyItems);

    const handleTabChange = (tab: GalleryTab) => {
        setSelectedIndex(null);
        setActiveTab(tab);
    };

    const handleClose = () => setSelectedIndex(null);

    const handlePrevious = useCallback(() => {
        if (selectedIndex === null) return;
        setSelectedIndex((selectedIndex - 1 + items.length) % items.length);
    }, [selectedIndex, items.length]);

    const handleNext = useCallback(() => {
        if (selectedIndex === null) return;
        setSelectedIndex((selectedIndex + 1) % items.length);
    }, [selectedIndex, items.length]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedIndex === null) return;
            if (e.key === "ArrowLeft") handlePrevious();
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "Escape") handleClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedIndex, handlePrevious, handleNext]);

    const currentItem = selectedIndex !== null ? items[selectedIndex] : null;

    return (
        <>
            <div className="flex justify-center gap-2 mb-10">
                <button
                    type="button"
                    onClick={() => handleTabChange("suites")}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                        activeTab === "suites"
                            ? "bg-[#FA5C5C] text-white"
                            : "bg-black/5 text-black/70 hover:bg-black/10"
                    }`}
                >
                    Suites
                </button>
                <button
                    type="button"
                    onClick={() => handleTabChange("property")}
                    className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors min-h-[44px] ${
                        activeTab === "property"
                            ? "bg-[#FA5C5C] text-white"
                            : "bg-black/5 text-black/70 hover:bg-black/10"
                    }`}
                >
                    Property
                </button>
            </div>

            {items.length === 0 ? (
                <p className="text-center text-black/60 py-12">
                    {activeTab === "suites"
                        ? "Suite photos will appear here once uploaded."
                        : "Property photos will appear here once uploaded in admin."}
                </p>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.key}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.05 }}
                            className="break-inside-avoid mb-4 cursor-pointer group"
                            onClick={() => setSelectedIndex(index)}
                        >
                            <div className="relative overflow-hidden rounded-2xl">
                                <div className="relative aspect-[4/3]">
                                    <ResponsiveApartmentImage
                                        image={item.image}
                                        variant="medium"
                                        alt={item.image.altText ?? `${item.label} photo`}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                                        {item.label}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {selectedIndex !== null && currentItem && (
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Image lightbox"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                        onClick={handleClose}
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-6 w-6 text-white" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handlePrevious();
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-colors"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="h-8 w-8 text-white" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleNext();
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-colors"
                            aria-label="Next image"
                        >
                            <ChevronRight className="h-8 w-8 text-white" />
                        </button>

                        <motion.div
                            key={selectedIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="relative w-[95vw] h-[90vh] max-w-[1800px]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ResponsiveApartmentImage
                                image={currentItem.image}
                                variant="large"
                                alt={currentItem.image.altText ?? `${currentItem.label} gallery`}
                                fill
                                className="object-contain"
                                sizes="95vw"
                                priority
                            />
                        </motion.div>

                        <div
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <p className="text-white/90 font-medium mb-1">
                                {currentItem.label}
                            </p>
                            <p className="text-white/60 text-sm">
                                {selectedIndex + 1} / {items.length}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
