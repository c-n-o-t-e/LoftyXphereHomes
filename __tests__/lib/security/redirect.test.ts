import {
  buildAuthEmailRedirectUrl,
  normalizeInternalRedirect,
} from "@/lib/security/redirect";

describe("normalizeInternalRedirect", () => {
  it("returns fallback for empty input", () => {
    expect(normalizeInternalRedirect("", "/my-bookings")).toBe("/my-bookings");
    expect(normalizeInternalRedirect(null, "/my-bookings")).toBe("/my-bookings");
  });

  it("allows internal absolute paths", () => {
    expect(normalizeInternalRedirect("/my-bookings", "/")).toBe("/my-bookings");
    expect(normalizeInternalRedirect("/apartments?x=1#top", "/")).toBe(
      "/apartments?x=1#top"
    );
  });

  it("blocks external and protocol-relative redirects", () => {
    expect(normalizeInternalRedirect("https://evil.com", "/safe")).toBe("/safe");
    expect(normalizeInternalRedirect("http://evil.com", "/safe")).toBe("/safe");
    expect(normalizeInternalRedirect("//evil.com", "/safe")).toBe("/safe");
    expect(normalizeInternalRedirect("javascript:alert(1)", "/safe")).toBe(
      "/safe"
    );
  });

  it("blocks non-absolute paths and backslashes", () => {
    expect(normalizeInternalRedirect("my-bookings", "/safe")).toBe("/safe");
    expect(normalizeInternalRedirect("\\\\evil.com\\x", "/safe")).toBe("/safe");
    expect(normalizeInternalRedirect("/\\evil", "/safe")).toBe("/safe");
  });

  it("collapses repeated slashes", () => {
    expect(normalizeInternalRedirect("/foo//bar///baz", "/safe")).toBe(
      "/foo/bar/baz"
    );
  });
});

describe("buildAuthEmailRedirectUrl", () => {
  it("builds callback URL with validated next param", () => {
    expect(buildAuthEmailRedirectUrl("https://example.com", "/my-bookings")).toBe(
      "https://example.com/auth/callback?next=%2Fmy-bookings",
    );
  });

  it("strips trailing slash from site base", () => {
    expect(buildAuthEmailRedirectUrl("https://example.com/", "/admin")).toBe(
      "https://example.com/auth/callback?next=%2Fadmin",
    );
  });

  it("uses fallback path when next is unsafe", () => {
    expect(buildAuthEmailRedirectUrl("https://example.com", "//evil")).toBe(
      "https://example.com/auth/callback?next=%2Fmy-bookings",
    );
  });
});

