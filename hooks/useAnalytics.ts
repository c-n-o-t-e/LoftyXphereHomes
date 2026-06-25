"use client";

import { useCallback } from "react";
import {
  trackEvent,
  trackApartmentView,
  trackApartmentGalleryOpen,
  trackApartmentImageInteraction,
  trackInquirySubmit,
  trackBookingComplete,
  trackWhatsAppClick,
  trackPhoneCallClick,
  trackContactFormConversion,
  trackBookingConversion,
} from "@/lib/analytics";
import type { AnalyticsEventParams } from "@/lib/analytics";

export function useAnalytics() {
  const track = useCallback((params: AnalyticsEventParams) => {
    trackEvent(params);
  }, []);

  return {
    trackEvent: track,
    trackApartmentView,
    trackApartmentGalleryOpen,
    trackApartmentImageInteraction,
    trackInquirySubmit,
    trackBookingComplete,
    trackWhatsAppClick,
    trackPhoneCallClick,
    trackContactFormConversion,
    trackBookingConversion,
  };
}
