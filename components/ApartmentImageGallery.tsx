"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Grid2x2 } from "lucide-react";
import type { ApartmentImageSet } from "@/lib/images/types";
import { ResponsiveApartmentImage } from "@/components/ResponsiveApartmentImage";
import { ApartmentImagePlaceholder } from "@/components/ApartmentImagePlaceholder";
import {
  trackApartmentGalleryOpen,
  trackApartmentImageInteraction,
} from "@/lib/analytics/events";

interface ApartmentImageGalleryProps {
    images: ApartmentImageSet[];
    name: string;
    apartmentId: string;
}

export function ApartmentImageGallery({ images, name, apartmentId }: ApartmentImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const allImages = images;
    const heroImage = allImages[0];
    const gridImages = allImages.slice(1, 5);
    const extraCount = Math.max(0, allImages.length - 5);

    const openLightbox = useCallback(
        (index: number, source: "grid" | "show_all" | "hero") => {
            setSelectedIndex(index);
            trackApartmentGalleryOpen({
                apartmentId,
                apartmentName: name,
                imageIndex: index,
                source,
            });
        },
        [apartmentId, name],
    );
    const closeLightbox = () => setSelectedIndex(null);

    const goPrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIndex((i) => {
            if (i === null) return null;
            const nextIndex = i === 0 ? allImages.length - 1 : i - 1;
            trackApartmentImageInteraction({
                apartmentId,
                apartmentName: name,
                imageIndex: nextIndex,
                interaction: "prev",
            });
            return nextIndex;
        });
    };
    const goNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedIndex((i) => {
            if (i === null) return null;
            const nextIndex = i === allImages.length - 1 ? 0 : i + 1;
            trackApartmentImageInteraction({
                apartmentId,
                apartmentName: name,
                imageIndex: nextIndex,
                interaction: "next",
            });
            return nextIndex;
        });
    };

    const selectThumbnail = (index: number) => {
        setSelectedIndex(index);
        trackApartmentImageInteraction({
            apartmentId,
            apartmentName: name,
            imageIndex: index,
            interaction: "thumbnail",
        });
    };

    useEffect(() => {
        if (selectedIndex === null) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") {
                setSelectedIndex((i) => {
                    if (i === null) return null;
                    const nextIndex = i === 0 ? allImages.length - 1 : i - 1;
                    trackApartmentImageInteraction({
                        apartmentId,
                        apartmentName: name,
                        imageIndex: nextIndex,
                        interaction: "prev",
                    });
                    return nextIndex;
                });
            }
            if (e.key === "ArrowRight") {
                setSelectedIndex((i) => {
                    if (i === null) return null;
                    const nextIndex = i === allImages.length - 1 ? 0 : i + 1;
                    trackApartmentImageInteraction({
                        apartmentId,
                        apartmentName: name,
                        imageIndex: nextIndex,
                        interaction: "next",
                    });
                    return nextIndex;
                });
            }
        };
        window.addEventListener("keydown", handleKey);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handleKey);
            document.body.style.overflow = "";
        };
    }, [selectedIndex, allImages.length, apartmentId, name]);

    if (allImages.length === 0) {
        return (
            <div className="relative mb-8 sm:mb-12">
                <div className="relative h-64 sm:h-80 md:h-[28rem] rounded-2xl overflow-hidden">
                    <ApartmentImagePlaceholder className="h-full w-full" />
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="relative mb-8 sm:mb-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="md:col-span-2 md:row-span-2">
                        <button
                            type="button"
                            onClick={() => openLightbox(0, "hero")}
                            className="relative h-64 sm:h-80 md:h-[28rem] rounded-2xl overflow-hidden w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FA5C5C] focus:ring-offset-2"
                            aria-label={`View ${name} - cover photo`}
                        >
                            <ResponsiveApartmentImage
                                image={heroImage!}
                                variant="large"
                                alt={heroImage?.altText ?? name}
                                fill
                                className="object-cover"
                                priority
                                sizes="(max-width: 768px) 100vw, 55vw"
                            />
                        </button>
                    </div>
                    {gridImages.map((image, index) => (
                        <button
                            key={`${image.large}-${index}`}
                            type="button"
                            onClick={() => openLightbox(index + 1, "grid")}
                            className="relative h-40 sm:h-48 md:h-[13.5rem] rounded-2xl overflow-hidden w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FA5C5C] focus:ring-offset-2"
                            aria-label={`View ${name} - Image ${index + 2}`}
                        >
                            <ResponsiveApartmentImage
                                image={image}
                                variant="medium"
                                alt={image.altText ?? `${name} - Image ${index + 2}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 25vw"
                            />
                            {index === gridImages.length - 1 && extraCount > 0 && (
                                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                                    <span className="text-white font-semibold text-lg">
                                        +{extraCount} more
                                    </span>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {allImages.length > 1 && (
                    <button
                        type="button"
                        onClick={() => openLightbox(0, "show_all")}
                        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black shadow-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#FA5C5C]"
                    >
                        <Grid2x2 className="h-4 w-4" />
                        Show all photos
                    </button>
                )}
            </div>

            {selectedIndex !== null && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex flex-col"
                    onClick={closeLightbox}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Full screen image gallery"
                >
                    <div className="flex items-center justify-between p-4 shrink-0">
                        <p className="text-white/80 text-sm">
                            {selectedIndex + 1} / {allImages.length}
                        </p>
                        <button
                            type="button"
                            onClick={closeLightbox}
                            className="p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Close"
                        >
                            <X className="h-8 w-8" />
                        </button>
                    </div>

                    <div className="relative flex-1 flex items-center justify-center px-4 pb-4 min-h-0">
                        {allImages.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    onClick={goPrev}
                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                    aria-label="Previous image"
                                >
                                    <ChevronLeft className="h-8 w-8 sm:h-10 sm:w-10" />
                                </button>
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                                    aria-label="Next image"
                                >
                                    <ChevronRight className="h-8 w-8 sm:h-10 sm:w-10" />
                                </button>
                            </>
                        )}

                        <div
                            className="relative w-full h-full max-w-6xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ResponsiveApartmentImage
                                image={allImages[selectedIndex]!}
                                variant="large"
                                alt={
                                    allImages[selectedIndex]?.altText ??
                                    `${name} - Image ${selectedIndex + 1}`
                                }
                                fill
                                className="object-contain"
                                sizes="100vw"
                                priority
                            />
                        </div>
                    </div>

                    {allImages.length > 1 && (
                        <div
                            className="shrink-0 px-4 pb-4 overflow-x-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex gap-2 justify-center min-w-min mx-auto">
                                {allImages.map((image, index) => (
                                    <button
                                        key={`thumb-${image.thumbnail}-${index}`}
                                        type="button"
                                        onClick={() => selectThumbnail(index)}
                                        className={`relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                                            index === selectedIndex
                                                ? "border-white"
                                                : "border-transparent opacity-70 hover:opacity-100"
                                        }`}
                                        aria-label={`View image ${index + 1}`}
                                        aria-current={index === selectedIndex}
                                    >
                                        <ResponsiveApartmentImage
                                            image={image}
                                            variant="thumbnail"
                                            alt=""
                                            fill
                                            className="object-cover"
                                            sizes="96px"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
