"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeroSearchBar from "./HeroSearchBar";

// Video URL from Pexels - luxury apartment interior tour
const HERO_VIDEO_URL = "https://videos.pexels.com/video-files/7578554/7578554-uhd_2560_1440_30fps.mp4";
// Fallback poster image if video fails to load
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&q=80";

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);

  // Ensure video plays on mount (some browsers block autoplay)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        // Autoplay was prevented, video will show poster instead
        console.log("Video autoplay was prevented");
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {!videoError ? (
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={FALLBACK_IMAGE}
            onError={() => setVideoError(true)}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={HERO_VIDEO_URL} type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${FALLBACK_IMAGE})` }}
          />
        )}
        {/* Gradient Overlay for Text Readability - lighter for brighter video */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
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

