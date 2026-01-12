"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 sm:mb-8 md:mb-10 leading-tight drop-shadow-2xl px-2 sm:px-4">
              Premium Shortlet
              <br />
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Apartments
              </span>
            </h1>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-10"
            >
              <HeroSearchBar />
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center mt-6 sm:mt-8 px-4 w-full sm:w-auto max-w-md sm:max-w-none mx-auto">
              <Button asChild size="lg" className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg bg-[#FA5C5C] text-white hover:bg-[#E84A4A] shadow-xl w-full sm:flex-1 sm:max-w-[240px] min-h-[48px] font-semibold">
                <Link href="/booking" className="flex items-center justify-center">
                  Book Your Stay
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg border-2 border-white text-white hover:bg-white hover:text-black bg-black/30 backdrop-blur-md shadow-xl w-full sm:flex-1 sm:max-w-[240px] min-h-[48px] font-semibold">
                <Link href="/apartments" className="flex items-center justify-center">Explore Apartments</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows - Only show if more than one image */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 group min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all duration-300 group min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6 text-white group-hover:scale-110 transition-transform" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full min-w-[32px] min-h-[8px] ${
                index === currentIndex
                  ? "w-12 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/80 rounded-full flex justify-center backdrop-blur-sm"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-1 h-3 bg-white/80 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}

