import { buildGtagConsentState } from "@/lib/analytics/gtagConsent";

describe("buildGtagConsentState", () => {
  it("grants all signals when analytics and marketing are enabled", () => {
    expect(buildGtagConsentState(true, true)).toEqual({
      analytics_storage: "granted",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  });

  it("denies ad signals when marketing is disabled", () => {
    expect(buildGtagConsentState(true, false)).toEqual({
      analytics_storage: "granted",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  });

  it("denies all signals when analytics is disabled", () => {
    expect(buildGtagConsentState(false, true)).toEqual({
      analytics_storage: "denied",
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
    });
  });
});
