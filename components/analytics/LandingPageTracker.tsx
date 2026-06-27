"use client";

import { useEffect, useRef } from "react";
import { trackLandingPageView } from "@/lib/analytics/events";

type LandingPageTrackerProps = {
  checkIn: string;
  checkOut: string;
  availableCount: number;
  usedDefaultDates?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  /** When false, tracking is deferred until availability has loaded. */
  ready?: boolean;
};

/** Fires `landing_page_view` once per landing session when availability is known. */
export function LandingPageTracker({
  checkIn,
  checkOut,
  availableCount,
  usedDefaultDates,
  utmSource,
  utmMedium,
  utmCampaign,
  utmTerm,
  utmContent,
  ready = true,
}: LandingPageTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!ready || trackedRef.current) return;
    trackedRef.current = true;

    trackLandingPageView({
      checkIn,
      checkOut,
      availableCount,
      usedDefaultDates,
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    });
  }, [
    ready,
    checkIn,
    checkOut,
    availableCount,
    usedDefaultDates,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
  ]);

  return null;
}
