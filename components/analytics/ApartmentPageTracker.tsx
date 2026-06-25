"use client";

import { useEffect, useRef } from "react";
import { trackApartmentView } from "@/lib/analytics/events";

type ApartmentPageTrackerProps = {
  apartmentId: string;
  apartmentName: string;
};

/** Fires `apartment_view` once per apartment detail mount. */
export function ApartmentPageTracker({
  apartmentId,
  apartmentName,
}: ApartmentPageTrackerProps) {
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (trackedRef.current === apartmentId) return;
    trackedRef.current = apartmentId;

    trackApartmentView({
      apartmentId,
      apartmentName,
      label: "Apartment Detail Page",
    });
  }, [apartmentId, apartmentName]);

  return null;
}
