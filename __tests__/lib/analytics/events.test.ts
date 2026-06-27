import { trackEvent, trackApartmentView, trackLandingPageView } from "@/lib/analytics/events";

const mockGtag = jest.fn();

beforeEach(() => {
  mockGtag.mockReset();
  window.gtag = mockGtag;
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
  window.history.pushState({}, "", "/");
  document.cookie = "lxh-consent-required=0; path=/";
  document.cookie = "lxh-analytics-internal=; path=/; max-age=0";
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  delete window.gtag;
});

describe("trackEvent", () => {
  it("sends GA4 events with category and label", () => {
    trackEvent({
      action: "whatsapp_click",
      category: "engagement",
      label: "Apartment Detail Page",
    });

    expect(mockGtag).toHaveBeenCalledWith("event", "whatsapp_click", {
      event_category: "engagement",
      event_label: "Apartment Detail Page",
    });
  });

  it("does nothing when GA is not configured", () => {
    delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    trackEvent({
      action: "whatsapp_click",
      category: "engagement",
    });

    expect(mockGtag).not.toHaveBeenCalled();
  });

  it("does nothing on admin routes", () => {
    window.history.pushState({}, "", "/admin/bookings");

    trackEvent({
      action: "whatsapp_click",
      category: "engagement",
    });

    expect(mockGtag).not.toHaveBeenCalled();
  });

  it("does nothing when consent is required but not granted", () => {
    document.cookie = "lxh-consent-required=1; path=/";

    trackEvent({
      action: "whatsapp_click",
      category: "engagement",
    });

    expect(mockGtag).not.toHaveBeenCalled();
  });

  it("does nothing when staff internal opt-out cookie is set", () => {
    document.cookie = "lxh-analytics-internal=1; path=/";

    trackEvent({
      action: "whatsapp_click",
      category: "engagement",
    });

    expect(mockGtag).not.toHaveBeenCalled();
  });
});

describe("trackApartmentView", () => {
  it("sends apartment_view with apartment metadata", () => {
    trackApartmentView({
      apartmentId: "apt-1",
      apartmentName: "Skyline Suite",
    });

    expect(mockGtag).toHaveBeenCalledWith("event", "apartment_view", {
      event_category: "apartment",
      event_label: "Apartment Detail Page",
      apartment_id: "apt-1",
      apartment_name: "Skyline Suite",
    });
  });
});

describe("trackLandingPageView", () => {
  it("sends landing_page_view with dates and UTM metadata", () => {
    trackLandingPageView({
      checkIn: "2026-07-04",
      checkOut: "2026-07-06",
      availableCount: 2,
      usedDefaultDates: false,
      utmSource: "google",
      utmCampaign: "brand",
    });

    expect(mockGtag).toHaveBeenCalledWith("event", "landing_page_view", {
      event_category: "engagement",
      event_label: "Ads Landing Page",
      page_location: "/book",
      check_in: "2026-07-04",
      check_out: "2026-07-06",
      available_count: 2,
      used_default_dates: false,
      utm_source: "google",
      utm_medium: undefined,
      utm_campaign: "brand",
      utm_term: undefined,
      utm_content: undefined,
    });
  });
});
