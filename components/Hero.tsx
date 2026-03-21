"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import HeroSearchBar from "./HeroSearchBar";

// Video URL from Pexels - luxury apartment interior tour
const HERO_VIDEO_URL = "https://videos.pexels.com/video-files/7578554/7578554-uhd_2560_1440_30fps.mp4";

/** CSS-only backdrop when the video fails (no third-party image dependency). */
function HeroVideoErrorBackdrop() {
  return (
    <div
      className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-800 to-neutral-950"
      aria-hidden
    />
  );
}

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const markVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

  // Hide loading when the first frame is available or playback actually starts
  // (loadeddata covers autoplay-blocked cases where playing may never fire until user gesture)
  useEffect(() => {
    if (videoError) return;
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => markVideoReady();
    video.addEventListener("playing", onReady);
    video.addEventListener("loadeddata", onReady);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      markVideoReady();
    }

    return () => {
      video.removeEventListener("playing", onReady);
      video.removeEventListener("loadeddata", onReady);
    };
  }, [videoError, markVideoReady]);

  // Ensure video plays on mount (some browsers block autoplay)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        console.log("Video autoplay was prevented");
      });
    }
  }, []);

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        {!videoError ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setVideoError(true)}
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src={HERO_VIDEO_URL} type="video/mp4" />
            </video>
            {/* Loading until first frame / playback (no external poster image) */}
            <div
              className={`absolute inset-0 z-[1] flex items-center justify-center bg-gradient-to-br from-stone-900/95 via-stone-800/95 to-neutral-950/95 transition-opacity duration-700 ease-out ${
                videoReady ? "pointer-events-none opacity-0" : "opacity-100"
              }`}
              aria-busy={!videoReady}
              aria-label="Loading hero video"
            >
              <Loader2
                className="h-10 w-10 text-white/40 animate-spin"
                aria-hidden
              />
            </div>
          </>
        ) : (
          <HeroVideoErrorBackdrop />
        )}
        {/* Light gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
      </div>

      {/* Content - centered vertically; no extra top margin on mobile */}
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

