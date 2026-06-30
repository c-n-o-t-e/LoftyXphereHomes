import {
  trackMetaContact,
  trackMetaLead,
  trackMetaPurchase,
  trackMetaViewContent,
} from "@/lib/analytics/metaPixel";

const mockFbq = jest.fn();

beforeEach(() => {
  mockFbq.mockReset();
  window.fbq = mockFbq;
  process.env.NEXT_PUBLIC_META_PIXEL_ID = "1234567890";
  document.cookie = "lxh-consent-required=0; path=/";
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_META_PIXEL_ID;
  delete window.fbq;
  document.cookie = "lxh-consent-required=0; path=/; max-age=0";
});

describe("Meta Pixel helpers", () => {
  it("tracks ViewContent for apartment pages", () => {
    trackMetaViewContent({
      apartmentId: "skyline-suite",
      apartmentName: "Skyline Suite",
    });

    expect(mockFbq).toHaveBeenCalledWith("track", "ViewContent", {
      content_ids: ["skyline-suite"],
      content_type: "product",
      content_name: "Skyline Suite",
      content_category: "short_term_rental",
      value: undefined,
      currency: "NGN",
    });
  });

  it("tracks Purchase with eventID for deduplication", () => {
    trackMetaPurchase({
      reference: "ref-abc",
      value: 85000,
    });

    expect(mockFbq).toHaveBeenCalledWith(
      "track",
      "Purchase",
      {
        value: 85000,
        currency: "NGN",
        content_ids: undefined,
        content_type: "product",
        content_category: "short_term_rental",
        num_items: 1,
      },
      { eventID: "ref-abc" },
    );
  });

  it("tracks Lead for contact forms", () => {
    trackMetaLead({ label: "Contact Form" });

    expect(mockFbq).toHaveBeenCalledWith("track", "Lead", {
      content_name: "Contact Form",
      content_category: "short_term_rental",
    });
  });

  it("tracks Contact and custom channel events for WhatsApp", () => {
    trackMetaContact({
      label: "Footer WhatsApp",
      channel: "whatsapp",
    });

    expect(mockFbq).toHaveBeenCalledWith("track", "Contact", {
      content_name: "Footer WhatsApp",
      content_category: "whatsapp",
      content_ids: undefined,
    });
    expect(mockFbq).toHaveBeenCalledWith("trackCustom", "whatsapp_click", {
      content_name: "Footer WhatsApp",
      apartment_id: undefined,
    });
  });

  it("does not fire when pixel ID is unset", () => {
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID;

    trackMetaLead({ label: "Contact Form" });

    expect(mockFbq).not.toHaveBeenCalled();
  });

  it("does not fire when marketing consent is required but missing in EEA mode", () => {
    process.env.NEXT_PUBLIC_COOKIE_CONSENT_MODE = "eea";
    document.cookie = "lxh-consent-required=1; path=/";

    trackMetaLead({ label: "Contact Form" });

    expect(mockFbq).not.toHaveBeenCalled();

    delete process.env.NEXT_PUBLIC_COOKIE_CONSENT_MODE;
  });
});
