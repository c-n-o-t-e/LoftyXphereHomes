"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ResponsiveApartmentImage } from "@/components/ResponsiveApartmentImage";
import type { ApartmentImageSet } from "@/lib/images/types";

type PropertyAmenityGalleryProps = {
    images: ApartmentImageSet[];
    name: string;
};

export function PropertyAmenityGallery({
    images,
    name,
}: PropertyAmenityGalleryProps) {
    const [index, setIndex] = useState(0);
    const hasMultiple = images.length > 1;

    const goPrev = useCallback(() => {
        setIndex((current) => (current === 0 ? images.length - 1 : current - 1));
    }, [images.length]);

    const goNext = useCallback(() => {
        setIndex((current) => (current === images.length - 1 ? 0 : current + 1));
    }, [images.length]);

    useEffect(() => {
        if (!hasMultiple) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") goPrev();
            if (e.key === "ArrowRight") goNext();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [hasMultiple, goPrev, goNext]);

    if (images.length === 0) {
        return (
            <div className="aspect-[16/10] rounded-2xl bg-black/5 flex items-center justify-center text-black/50">
                Photos coming soon
            </div>
        );
    }

    return (
        <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black/5 group">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                >
                    <ResponsiveApartmentImage
                        image={images[index]}
                        alt={images[index].altText ?? `${name} - image ${index + 1}`}
                        fill
                        variant="large"
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                        priority={index === 0}
                    />
                </motion.div>
            </AnimatePresence>

            {hasMultiple && (
                <>
                    <button
                        type="button"
                        onClick={goPrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-5 w-5 text-black" />
                    </button>
                    <button
                        type="button"
                        onClick={goNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/90 hover:bg-white shadow-md opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-5 w-5 text-black" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setIndex(i)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                    i === index ? "bg-white w-4" : "bg-white/60 hover:bg-white/80"
                                }`}
                                aria-label={`Go to image ${i + 1}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
