import { sendGaEvent } from "@/lib/analytics/gtag";
import {
  trackMetaInitiateCheckout,
  trackMetaViewContent,
} from "@/lib/analytics/metaPixel";

export type AnalyticsEventCategory =
  | "engagement"
  | "apartment"
  | "conversion"
  | "inquiry";

export type AnalyticsEventParams = {
  action: string;
  category?: AnalyticsEventCategory;
  label?: string;
  value?: number;
  apartment_id?: string;
  apartment_name?: string;
  image_index?: number;
  page_location?: string;
  [key: string]: string | number | boolean | undefined;
};

/** Generic GA4 event helper — maps legacy action/category/label to GA4 params. */
export function trackEvent({
  action,
  category,
  label,
  value,
  ...rest
}: AnalyticsEventParams): void {
  sendGaEvent(action, {
    event_category: category,
    event_label: label,
    value,
    ...rest,
  });
}

export function trackApartmentView(params: {
  apartmentId: string;
  apartmentName: string;
  label?: string;
}): void {
  trackEvent({
    action: "apartment_view",
    category: "apartment",
    label: params.label ?? "Apartment Detail Page",
    apartment_id: params.apartmentId,
    apartment_name: params.apartmentName,
  });

  trackMetaViewContent({
    apartmentId: params.apartmentId,
    apartmentName: params.apartmentName,
  });
}

export function trackApartmentGalleryOpen(params: {
  apartmentId: string;
  apartmentName: string;
  imageIndex: number;
  source: "grid" | "show_all" | "hero";
}): void {
  trackEvent({
    action: "apartment_gallery_open",
    category: "apartment",
    label: params.apartmentName,
    apartment_id: params.apartmentId,
    apartment_name: params.apartmentName,
    image_index: params.imageIndex,
    gallery_source: params.source,
  });
}

export function trackApartmentImageInteraction(params: {
  apartmentId: string;
  apartmentName: string;
  imageIndex: number;
  interaction: "select" | "prev" | "next" | "thumbnail";
}): void {
  trackEvent({
    action: "apartment_image_interaction",
    category: "apartment",
    label: params.apartmentName,
    apartment_id: params.apartmentId,
    apartment_name: params.apartmentName,
    image_index: params.imageIndex,
    interaction_type: params.interaction,
  });
}

export function trackApartmentVideoTourOpen(params: {
  apartmentId: string;
  apartmentName: string;
  source: "hero_tile" | "lightbox";
}): void {
  trackEvent({
    action: "apartment_video_tour_open",
    category: "apartment",
    label: params.apartmentName,
    apartment_id: params.apartmentId,
    apartment_name: params.apartmentName,
    video_source: params.source,
  });
}

export function trackApartmentVideoTourProgress(params: {
  apartmentId: string;
  apartmentName: string;
  milestone: "start" | "complete";
}): void {
  trackEvent({
    action: "apartment_video_tour_progress",
    category: "apartment",
    label: params.apartmentName,
    apartment_id: params.apartmentId,
    apartment_name: params.apartmentName,
    video_milestone: params.milestone,
  });
}

export function trackInquirySubmit(params: {
  category: string;
  label?: string;
}): void {
  trackEvent({
    action: "inquiry_submit",
    category: "inquiry",
    label: params.label ?? "Contact Form",
    inquiry_category: params.category,
  });
}

export function trackBookingComplete(params: {
  reference?: string;
  label?: string;
}): void {
  trackEvent({
    action: "booking_complete",
    category: "conversion",
    label: params.label ?? "Booking Success Page",
    transaction_id: params.reference,
  });
}

export function trackLandingPageView(params: {
  checkIn: string;
  checkOut: string;
  availableCount: number;
  usedDefaultDates?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}): void {
  trackEvent({
    action: "landing_page_view",
    category: "engagement",
    label: "Ads Landing Page",
    page_location: "/book",
    check_in: params.checkIn,
    check_out: params.checkOut,
    available_count: params.availableCount,
    used_default_dates: params.usedDefaultDates,
    utm_source: params.utmSource,
    utm_medium: params.utmMedium,
    utm_campaign: params.utmCampaign,
    utm_term: params.utmTerm,
    utm_content: params.utmContent,
  });

  trackMetaInitiateCheckout();
}
