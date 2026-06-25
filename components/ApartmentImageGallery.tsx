"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Grid2x2, Play } from "lucide-react";
import type { ApartmentImageSet } from "@/lib/images/types";
import type { ApartmentVideoConfig } from "@/lib/videos/types";
import { ResponsiveApartmentImage } from "@/components/ResponsiveApartmentImage";
import { ApartmentImagePlaceholder } from "@/components/ApartmentImagePlaceholder";
import { ApartmentVideoPlayer } from "@/components/ApartmentVideoPlayer";
import {
  trackApartmentGalleryOpen,
  trackApartmentImageInteraction,
  trackApartmentVideoTourOpen,
  trackApartmentVideoTourProgress,
} from "@/lib/analytics/events";

interface ApartmentImageGalleryProps {
    images: ApartmentImageSet[];
    name: string;
    apartmentId: string;
    video?: ApartmentVideoConfig | null;
}

export function ApartmentImageGallery({ images, name, apartmentId, video = null }: ApartmentImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const allImages = images;
    const hasVideo = Boolean(video?.posterUrl);
    const heroImage = allImages[0];
    const gridImages = hasVideo ? allImages.slice(0, 5) : allImages.slice(1, 5);
    const extraCount = hasVideo
        ? Math.max(0, allImages.length - 5)
        : Math.max(0, allImages.length - 5);

    const openVideoTour = useCallback(
        (source: "hero_tile" | "lightbox") => {
            setIsVideoOpen(true);
            trackApartmentVideoTourOpen({
                apartmentId,
                apartmentName: name,
                source,
            });
        },
        [apartmentId, name],
    );
    const closeVideoTour = () => setIsVideoOpen(false);

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
        if (selectedIndex === null && !isVideoOpen) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (isVideoOpen) closeVideoTour();
                else closeLightbox();
            }
            if (e.key === "ArrowLeft" && !isVideoOpen) {
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
            if (e.key === "ArrowRight" && !isVideoOpen) {
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
    }, [selectedIndex, isVideoOpen, allImages.length, apartmentId, name]);

    if (allImages.length === 0 && !hasVideo) {
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
                    {hasVideo && video ? (
                        <div className="md:col-span-2 md:row-span-2">
                            <button
                                type="button"
                                onClick={() => openVideoTour("hero_tile")}
                                className="relative h-64 sm:h-80 md:h-[28rem] rounded-2xl overflow-hidden w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FA5C5C] focus:ring-offset-2 group"
                                aria-label={`Watch video tour of ${name}`}
                            >
                                <Image
                                    src={video.posterUrl}
                                    alt={`${name} video tour poster`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 55vw"
                                    priority
                                />
                                <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-black shadow-lg group-hover:scale-105 transition-transform">
                                        <Play className="h-7 w-7 ml-1" aria-hidden />
                                    </span>
                                    <span className="rounded-full bg-black/60 px-4 py-1.5 text-sm font-medium text-white">
                                        Watch tour
                                    </span>
                                </div>
                            </button>
                        </div>
                    ) : heroImage ? (
                        <div className="md:col-span-2 md:row-span-2">
                            <button
                                type="button"
                                onClick={() => openLightbox(0, "hero")}
                                className="relative h-64 sm:h-80 md:h-[28rem] rounded-2xl overflow-hidden w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FA5C5C] focus:ring-offset-2"
                                aria-label={`View ${name} - cover photo`}
                            >
                                <ResponsiveApartmentImage
                                    image={heroImage}
                                    variant="large"
                                    alt={heroImage.altText ?? name}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="(max-width: 768px) 100vw, 55vw"
                                />
                            </button>
                        </div>
                    ) : null}
                    {gridImages.map((image, index) => (
                        <button
                            key={`${image.large}-${index}`}
                            type="button"
                            onClick={() =>
                                openLightbox(
                                    hasVideo ? index : index + 1,
                                    "grid",
                                )
                            }
                            className="relative h-40 sm:h-48 md:h-[13.5rem] rounded-2xl overflow-hidden w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FA5C5C] focus:ring-offset-2"
                            aria-label={`View ${name} - Image ${hasVideo ? index + 1 : index + 2}`}
                        >
                            <ResponsiveApartmentImage
                                image={image}
                                variant="medium"
                                alt={image.altText ?? `${name} - Image ${hasVideo ? index + 1 : index + 2}`}
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
                {hasVideo && allImages.length === 0 && (
                    <p className="mt-3 text-sm text-black/60 px-1">
                        Video tour available — add photos to complete this gallery.
                    </p>
                )}
            </div>

            {isVideoOpen && video && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex flex-col"
                    onClick={closeVideoTour}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${name} video tour`}
                >
                    <div className="flex items-center justify-between p-4 shrink-0">
                        <p className="text-white/80 text-sm">Video tour</p>
                        <button
                            type="button"
                            onClick={closeVideoTour}
                            className="p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label="Close video tour"
                        >
                            <X className="h-8 w-8" />
                        </button>
                    </div>
                    <div
                        className="relative flex-1 flex items-center justify-center px-4 pb-4 min-h-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative w-full max-w-5xl aspect-video">
                            <ApartmentVideoPlayer
                                video={video}
                                autoPlay
                                onPlay={() =>
                                    trackApartmentVideoTourProgress({
                                        apartmentId,
                                        apartmentName: name,
                                        milestone: "start",
                                    })
                                }
                                onEnded={() =>
                                    trackApartmentVideoTourProgress({
                                        apartmentId,
                                        apartmentName: name,
                                        milestone: "complete",
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>
            )}

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
