import {
  trackWhatsAppClick,
  trackPhoneCallClick,
  trackContactFormConversion,
  trackBookingConversion,
} from "@/lib/analytics/conversions";

const mockGtag = jest.fn();

beforeEach(() => {
  mockGtag.mockReset();
  window.gtag = mockGtag;
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";
  delete process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  delete process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
  delete window.gtag;
});

describe("conversion tracking helpers", () => {
  it("tracks whatsapp_click engagement events", () => {
    trackWhatsAppClick({
      label: "Site-wide WhatsApp Float Button",
      category: "engagement",
    });

    expect(mockGtag).toHaveBeenCalledWith("event", "whatsapp_click", {
      event_category: "engagement",
      event_label: "Site-wide WhatsApp Float Button",
      apartment_id: undefined,
      transaction_id: undefined,
    });
  });

  it("tracks phone_call_click engagement events", () => {
    trackPhoneCallClick({
      label: "Footer Phone Link",
      category: "engagement",
    });

    expect(mockGtag).toHaveBeenCalledWith("event", "phone_call_click", {
      event_category: "engagement",
      event_label: "Footer Phone Link",
      apartment_id: undefined,
      transaction_id: undefined,
    });
  });

  it("tracks inquiry_submit on contact form success", () => {
    trackContactFormConversion({
      inquiryCategory: "booking",
      label: "Contact Form",
    });

    expect(mockGtag).toHaveBeenCalledWith("event", "inquiry_submit", {
      event_category: "inquiry",
      event_label: "Contact Form",
      inquiry_category: "booking",
    });
  });

  it("tracks booking_complete on successful checkout", () => {
    trackBookingConversion({
      reference: "ref-123",
      label: "Booking Success Page",
    });

    expect(mockGtag).toHaveBeenCalledWith("event", "booking_complete", {
      event_category: "conversion",
      event_label: "Booking Success Page",
      transaction_id: "ref-123",
      value: undefined,
      currency: "NGN",
    });
  });

  it("prepares Google Ads conversion events when conversion ID is set", () => {
    process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID = "AW-TEST456";

    trackWhatsAppClick({
      label: "Footer",
      category: "engagement",
    });

    expect(mockGtag).toHaveBeenCalledWith("event", "conversion", {
      send_to: "AW-TEST456/whatsapp_click",
      value: undefined,
      currency: "NGN",
      transaction_id: undefined,
      event_label: "Footer",
    });
  });
});
