"use client";

import { useEffect, useRef } from "react";
import { trackBookingConversion } from "@/lib/analytics/conversions";

type BookingSuccessTrackerProps = {
  isConfirmed: boolean;
  reference?: string;
};

/** Fires `booking_complete` once when payment is verified on the success page. */
export function BookingSuccessTracker({
  isConfirmed,
  reference,
}: BookingSuccessTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!isConfirmed || trackedRef.current) return;
    trackedRef.current = true;

    trackBookingConversion({
      reference: reference?.trim() || undefined,
      label: "Booking Success Page",
    });
  }, [isConfirmed, reference]);

  return null;
}
