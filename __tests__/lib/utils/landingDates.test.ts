import {
  formatDateIsoLocal,
  getDefaultLandingDates,
  parseLandingDatesFromParams,
  buildBookingSearchParams,
  appendUtmParams,
  extractUtmParams,
  LANDING_DEFAULT_NIGHTS,
} from "@/lib/utils/landingDates";

describe("formatDateIsoLocal", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(formatDateIsoLocal(new Date(2026, 5, 27))).toBe("2026-06-27");
  });
});

describe("getDefaultLandingDates", () => {
  it("returns check-in today and check-out after LANDING_DEFAULT_NIGHTS", () => {
    const ref = new Date(2026, 5, 27);
    const { checkIn, checkOut } = getDefaultLandingDates(ref);
    expect(checkIn).toBe("2026-06-27");
    expect(checkOut).toBe("2026-06-29");
    expect(LANDING_DEFAULT_NIGHTS).toBe(2);
  });
});

describe("parseLandingDatesFromParams", () => {
  const ref = new Date(2026, 5, 27);

  it("uses URL dates when valid", () => {
    const result = parseLandingDatesFromParams(
      "2026-07-04",
      "2026-07-06",
      ref,
    );
    expect(result).toEqual({
      checkIn: "2026-07-04",
      checkOut: "2026-07-06",
      usedDefaults: false,
    });
  });

  it("falls back to defaults when dates are missing", () => {
    const result = parseLandingDatesFromParams(null, null, ref);
    expect(result.checkIn).toBe("2026-06-27");
    expect(result.checkOut).toBe("2026-06-29");
    expect(result.usedDefaults).toBe(true);
  });

  it("falls back to defaults when check-out is before check-in", () => {
    const result = parseLandingDatesFromParams(
      "2026-07-10",
      "2026-07-08",
      ref,
    );
    expect(result.usedDefaults).toBe(true);
    expect(result.checkIn).toBe("2026-06-27");
  });

  it("falls back when check-in is in the past", () => {
    const result = parseLandingDatesFromParams(
      "2020-01-01",
      "2020-01-05",
      ref,
    );
    expect(result.usedDefaults).toBe(true);
  });
});

describe("buildBookingSearchParams", () => {
  it("builds check-in, check-out, and guests query string", () => {
    const qs = buildBookingSearchParams({
      checkIn: "2026-07-04",
      checkOut: "2026-07-06",
      guests: 2,
    });
    const params = new URLSearchParams(qs);
    expect(params.get("checkIn")).toBe("2026-07-04");
    expect(params.get("checkOut")).toBe("2026-07-06");
    expect(params.get("guests")).toBe("2");
  });
});

describe("appendUtmParams", () => {
  it("copies UTM params from source to target", () => {
    const source = new URLSearchParams(
      "utm_source=google&utm_campaign=brand&checkIn=2026-01-01",
    );
    const target = new URLSearchParams("checkIn=2026-07-01");
    appendUtmParams(target, source);
    expect(target.get("utm_source")).toBe("google");
    expect(target.get("utm_campaign")).toBe("brand");
    expect(target.get("checkIn")).toBe("2026-07-01");
  });
});

describe("extractUtmParams", () => {
  it("returns only UTM keys present in search params", () => {
    const params = new URLSearchParams(
      "utm_source=google&utm_medium=cpc&checkIn=2026-01-01",
    );
    expect(extractUtmParams(params)).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
    });
  });
});
