import {
  consentRequiresBanner,
  getCookieConsentMode,
  isAnalyticsAllowedByConsent,
  parseAnalyticsConsent,
} from "@/lib/analytics/consent";

describe("parseAnalyticsConsent", () => {
  it("maps stored values to consent states", () => {
    expect(parseAnalyticsConsent("granted")).toBe("granted");
    expect(parseAnalyticsConsent("denied")).toBe("denied");
    expect(parseAnalyticsConsent(undefined)).toBe("pending");
  });
});

describe("consentRequiresBanner", () => {
  it("shows banner only for EEA-required visitors without a choice", () => {
    expect(consentRequiresBanner(true, "pending")).toBe(true);
    expect(consentRequiresBanner(true, "granted")).toBe(false);
    expect(consentRequiresBanner(false, "pending")).toBe(false);
  });
});

describe("isAnalyticsAllowedByConsent", () => {
  it("allows analytics outside consent regions immediately", () => {
    expect(isAnalyticsAllowedByConsent(false, "pending")).toBe(true);
  });

  it("requires explicit grant in consent regions", () => {
    expect(isAnalyticsAllowedByConsent(true, "pending")).toBe(false);
    expect(isAnalyticsAllowedByConsent(true, "denied")).toBe(false);
    expect(isAnalyticsAllowedByConsent(true, "granted")).toBe(true);
  });
});

describe("getCookieConsentMode", () => {
  const previous = process.env.NEXT_PUBLIC_COOKIE_CONSENT_MODE;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.NEXT_PUBLIC_COOKIE_CONSENT_MODE;
    } else {
      process.env.NEXT_PUBLIC_COOKIE_CONSENT_MODE = previous;
    }
  });

  it("defaults to eea mode", () => {
    delete process.env.NEXT_PUBLIC_COOKIE_CONSENT_MODE;
    expect(getCookieConsentMode()).toBe("eea");
  });

  it("supports always and off overrides", () => {
    process.env.NEXT_PUBLIC_COOKIE_CONSENT_MODE = "always";
    expect(getCookieConsentMode()).toBe("always");

    process.env.NEXT_PUBLIC_COOKIE_CONSENT_MODE = "off";
    expect(getCookieConsentMode()).toBe("off");
  });
});
