import {
  INTERNAL_TRAFFIC_COOKIE,
  isInternalTrafficOptedOut,
  readClientInternalTrafficOptedOut,
} from "@/lib/analytics/internal";

describe("isInternalTrafficOptedOut", () => {
  it("detects the internal traffic cookie", () => {
    expect(isInternalTrafficOptedOut("1")).toBe(true);
    expect(isInternalTrafficOptedOut("0")).toBe(false);
    expect(isInternalTrafficOptedOut(undefined)).toBe(false);
  });
});

describe("readClientInternalTrafficOptedOut", () => {
  beforeEach(() => {
    document.cookie = `${INTERNAL_TRAFFIC_COOKIE}=; path=/; max-age=0`;
  });

  it("reads the opt-out cookie in the browser", () => {
    document.cookie = `${INTERNAL_TRAFFIC_COOKIE}=1; path=/`;
    expect(readClientInternalTrafficOptedOut()).toBe(true);
  });

  it("returns false when cookie is absent", () => {
    expect(readClientInternalTrafficOptedOut()).toBe(false);
  });
});
