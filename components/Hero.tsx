"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeroSearchBar from "./HeroSearchBar";
import type { HeroVideoConfig } from "@/lib/videos/types";

type HeroProps = {
  heroVideo?: HeroVideoConfig | null;
};

function resolveVideoSrc(heroVideo: HeroVideoConfig, preferMobile: boolean) {
  if (preferMobile && heroVideo.mobileMp4Url) {
    return heroVideo.mobileMp4Url;
  }
  return heroVideo.desktopMp4Url || heroVideo.mobileMp4Url || null;
}

export default function Hero({ heroVideo = null }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(() =>
    heroVideo ? resolveVideoSrc(heroVideo, false) : null,
  );
  const [showPosterFallback, setShowPosterFallback] = useState(false);

  const hasVideo = Boolean(
    heroVideo?.mobileMp4Url || heroVideo?.desktopMp4Url,
  );

  useEffect(() => {
    if (!heroVideo) {
      setVideoSrc(null);
      return;
    }

    if (typeof window.matchMedia !== "function") {
      setVideoSrc(resolveVideoSrc(heroVideo, false));
      return;
    }

    const mq = window.matchMedia("(max-width: 768px)");
    const syncSrc = () => {
      setVideoSrc(resolveVideoSrc(heroVideo, mq.matches));
    };

    syncSrc();
    mq.addEventListener("change", syncSrc);
    return () => mq.removeEventListener("change", syncSrc);
  }, [heroVideo]);

  useEffect(() => {
    if (!videoSrc) return;
    const video = videoRef.current;
    if (!video) return;

    setShowPosterFallback(false);
    video.load();
    video.play().catch(() => {
      // Autoplay may be blocked; poster remains visible via the video element.
    });
  }, [videoSrc]);

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {hasVideo && videoSrc && !showPosterFallback ? (
          <video
            ref={videoRef}
            key={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={heroVideo?.posterUrl}
            onError={() => setShowPosterFallback(true)}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : heroVideo?.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroVideo.posterUrl}
            alt=""
            aria-hidden
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
      </div>

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
