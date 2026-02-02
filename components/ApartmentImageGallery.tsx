"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80";

interface ApartmentImageGalleryProps {
  images: string[];
  name: string;
}

export function ApartmentImageGallery({ images, name }: ApartmentImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const displayImages = [
    images[0] || FALLBACK_IMAGE,
    ...images.slice(1, 5),
  ].filter(Boolean);

  const openLightbox = (index: number) => setSelectedIndex(index);
  const closeLightbox = () => setSelectedIndex(null);

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((i) => (i === null ? null : i === 0 ? displayImages.length - 1 : i - 1));
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((i) => (i === null ? null : i === displayImages.length - 1 ? 0 : i + 1));
  };

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") {
        setSelectedIndex((i) => (i === null ? null : i === 0 ? displayImages.length - 1 : i - 1));
      }
      if (e.key === "ArrowRight") {
        setSelectedIndex((i) => (i === null ? null : i === displayImages.length - 1 ? 0 : i + 1));
      }
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, displayImages.length]);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => openLightbox(0)}
            className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FA5C5C] focus:ring-offset-2"
            aria-label={`View ${name} - Image 1`}
          >
            <Image
              src={displayImages[0]}
              alt={name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 80vw"
            />
          </button>
        </div>
        {displayImages.slice(1).map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => openLightbox(index + 1)}
            className="relative h-40 sm:h-48 rounded-2xl overflow-hidden w-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FA5C5C] focus:ring-offset-2"
            aria-label={`View ${name} - Image ${index + 2}`}
          >
            <Image
              src={image}
              alt={`${name} - Image ${index + 2}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Full screen image"
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close"
          >
            <X className="h-8 w-8" />
          </button>

          {displayImages.length > 1 && (
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
            className="relative w-full h-full max-w-6xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={displayImages[selectedIndex]}
              alt={`${name} - Image ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {displayImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-white/80 text-sm">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
