"use client";

import { CalendarRange } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Soft nudge above the landing search bar — encourages picking future dates
 * when the default (today + 2 nights) is not what the guest needs.
 */
export function LandingDateSearchHint() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex justify-center mb-4 sm:mb-5 px-2"
    >
      <motion.div
        role="note"
        aria-label="Planning ahead? Pick your check-in and check-out dates in the search below."
        animate={
          prefersReducedMotion
            ? undefined
            : {
                y: [0, -4, 0],
              }
        }
        transition={
          prefersReducedMotion
            ? undefined
            : {
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1.2,
              }
        }
        className="inline-flex items-center gap-2.5 sm:gap-3 rounded-full border border-[#FA5C5C]/25 bg-[#FA5C5C]/6 px-4 py-2.5 sm:px-5 sm:py-3 shadow-sm max-w-lg"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FA5C5C]/15">
          <CalendarRange
            className="h-4 w-4 text-[#FA5C5C]"
            aria-hidden
          />
        </span>
        <p className="text-left text-sm sm:text-[0.9375rem] leading-snug text-black/80">
          <span className="font-semibold text-black">Not booking for today?</span>
          <span className="text-black/70"> Pick your dates below.</span>
        </p>
      </motion.div>
    </motion.div>
  );
}
