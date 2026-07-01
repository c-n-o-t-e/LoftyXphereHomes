"use client";

import { motion } from "framer-motion";
import HeroSearchBar from "./HeroSearchBar";
import type { HeroVideoConfig } from "@/lib/videos/types";

type HeroProps = {
  heroVideo?: HeroVideoConfig | null;
};

const heroVideoClassName = "absolute inset-0 h-full w-full object-cover";

type HeroVideoElementProps = {
  src: string;
  poster?: string;
  className: string;
  preload: "auto" | "metadata" | "none";
};

function HeroVideoElement({
  src,
  poster,
  className,
  preload,
}: HeroVideoElementProps) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload={preload}
      poster={poster}
      aria-hidden
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

function HeroBackgroundVideo({ heroVideo }: { heroVideo: HeroVideoConfig }) {
  const mobileSrc = heroVideo.mobileMp4Url?.trim() || undefined;
  const desktopSrc = heroVideo.desktopMp4Url?.trim() || undefined;
  const desktopPoster = heroVideo.posterUrl?.trim() || undefined;
  const mobilePoster =
    heroVideo.mobilePosterUrl?.trim() || desktopPoster || undefined;

  if (mobileSrc && desktopSrc) {
    return (
      <>
        <HeroVideoElement
          src={mobileSrc}
          poster={mobilePoster}
          preload="auto"
          className={`${heroVideoClassName} md:hidden`}
        />
        <HeroVideoElement
          src={desktopSrc}
          poster={desktopPoster}
          preload="auto"
          className={`${heroVideoClassName} hidden md:block`}
        />
      </>
    );
  }

  const fallbackSrc = mobileSrc ?? desktopSrc;
  if (!fallbackSrc) return null;

  return (
    <HeroVideoElement
      src={fallbackSrc}
      poster={mobileSrc ? mobilePoster : desktopPoster}
      preload="auto"
      className={heroVideoClassName}
    />
  );
}

export default function Hero({ heroVideo = null }: HeroProps) {
  const hasVideo = Boolean(
    heroVideo?.mobileMp4Url?.trim() || heroVideo?.desktopMp4Url?.trim(),
  );

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {hasVideo && heroVideo ? <HeroBackgroundVideo heroVideo={heroVideo} /> : null}

        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/10 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 1, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
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
              initial={{ opacity: 1, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.05, ease: "easeOut" }}
            >
              <HeroSearchBar />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
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
