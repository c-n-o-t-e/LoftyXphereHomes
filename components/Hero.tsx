"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFeaturedApartments } from "@/lib/data/apartments";
import HeroSearchBar from "./HeroSearchBar";

const TRANSITION_DURATION = 5000; // 5 seconds per image
const FADE_DURATION = 1000; // 1 second fade transition

export default function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Get featured apartment images - take first image from each featured apartment
  const featuredApartments = getFeaturedApartments(6);
  const heroImages = featuredApartments
    .map((apt) => apt.images[0])
    .filter((img): img is string => !!img);

  // If no images, use fallback
  const images = heroImages.length > 0 
    ? heroImages 
    : ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&q=80"];

  // Auto-advance slideshow
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, TRANSITION_DURATION);

    return () => clearInterval(interval);
  }, [isAutoPlaying, images.length]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Image Slideshow Background */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          {images.map((image, index) => {
            if (index !== currentIndex) return null;

            return (
              <motion.div
                key={`${image}-${index}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: FADE_DURATION / 1000, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={image}
                  alt={`Hero image ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                  quality={90}
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full"
          >
            <p className="text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white/60 mb-2 sm:mb-4 font-light">
              LoftyXphereHomes
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-2 sm:mb-4 leading-[1.1] drop-shadow-2xl">
              Live Lofty.
              <br />
              <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                Stay Different.
              </span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/70 font-light mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Where luxury meets comfort in the heart of Abuja
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <HeroSearchBar />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows - Hidden on mobile, visible on tablet+ */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="hidden sm:flex absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all duration-300 group border border-white/10 items-center justify-center"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 group-hover:text-white transition-colors" />
          </button>
          <button
            onClick={goToNext}
            className="hidden sm:flex absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm transition-all duration-300 group border border-white/10 items-center justify-center"
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-white/70 group-hover:text-white transition-colors" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-14 sm:bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-500 rounded-full h-0.5 sm:h-1 ${
                index === currentIndex
                  ? "w-6 sm:w-8 bg-white"
                  : "w-1.5 sm:w-2 bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator - Hidden on mobile for cleaner look */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="hidden sm:block absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.p
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-[10px] sm:text-xs text-white/50 uppercase tracking-widest font-light"
        >
          Scroll to explore
        </motion.p>
      </motion.div>
    </section>
  );
}

