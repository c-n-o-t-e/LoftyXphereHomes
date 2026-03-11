"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { apartments } from "@/lib/data/apartments";

export default function GalleryPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Collect all images from all apartments
  const allImages = apartments.flatMap((apt) =>
    apt.images.map((img) => ({
      src: img,
      apartment: apt.name,
      apartmentId: apt.id,
    }))
  );

  const handleImageClick = (index: number) => {
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedIndex(null);
  };

  const handlePrevious = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex - 1 + allImages.length) % allImages.length);
  }, [selectedIndex, allImages.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((selectedIndex + 1) % allImages.length);
  }, [selectedIndex, allImages.length]);

  // Keyboard navigation
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

  const currentImage = selectedIndex !== null ? allImages[selectedIndex] : null;

  return (
    <>
      <div className="pt-20 pb-24 bg-white min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 pt-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6">
              Gallery
            </h1>
            <p className="text-lg md:text-xl text-black/70 max-w-2xl mx-auto leading-relaxed">
              Explore our premium apartments through stunning visuals
            </p>
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {allImages.map((item, index) => (
              <motion.div
                key={`${item.apartmentId}-${index}`}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="break-inside-avoid mb-4 cursor-pointer group"
                onClick={() => handleImageClick(index)}
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.src}
                      alt={`${item.apartment} - Image ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      {item.apartment}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {selectedIndex !== null && currentImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={handleClose}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6 text-white" />
            </button>

            {/* Previous Button */}
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

            {/* Next Button */}
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

            {/* Image Container */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-[95vw] h-[90vh] max-w-[1800px]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={currentImage.src}
                alt={`${currentImage.apartment} - Gallery image`}
                fill
                className="object-contain"
                sizes="95vw"
                priority
              />
            </motion.div>

            {/* Image Info & Counter */}
            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white/90 font-medium mb-1">{currentImage.apartment}</p>
              <p className="text-white/60 text-sm">
                {selectedIndex + 1} / {allImages.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

