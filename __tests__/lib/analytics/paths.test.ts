import {
  isAnalyticsAllowedPath,
  isAnalyticsExcludedPath,
} from "@/lib/analytics/paths";

describe("isAnalyticsExcludedPath", () => {
  it("excludes /admin and nested admin routes", () => {
    expect(isAnalyticsExcludedPath("/admin")).toBe(true);
    expect(isAnalyticsExcludedPath("/admin/bookings")).toBe(true);
    expect(isAnalyticsExcludedPath("/admin/apartments/abc/images")).toBe(true);
  });

  it("allows public marketing routes", () => {
    expect(isAnalyticsExcludedPath("/")).toBe(false);
    expect(isAnalyticsExcludedPath("/apartments")).toBe(false);
    expect(isAnalyticsExcludedPath("/apartments/skyline-suite")).toBe(false);
    expect(isAnalyticsExcludedPath("/contact")).toBe(false);
    expect(isAnalyticsExcludedPath("/booking/success")).toBe(false);
  });

  it("does not exclude paths that only contain admin as a substring", () => {
    expect(isAnalyticsExcludedPath("/about-admin-tools")).toBe(false);
  });
});

describe("isAnalyticsAllowedPath", () => {
  it("is the inverse of isAnalyticsExcludedPath", () => {
    expect(isAnalyticsAllowedPath("/admin")).toBe(false);
    expect(isAnalyticsAllowedPath("/apartments")).toBe(true);
  });
});
