import { timingSafeEqualAny, timingSafeEqualHex } from "@/lib/security/timing";

describe("timingSafeEqualHex", () => {
  it("returns true for identical hex strings", () => {
    const digest = "a".repeat(128);
    expect(timingSafeEqualHex(digest, digest)).toBe(true);
  });

  it("returns false for different lengths", () => {
    expect(timingSafeEqualHex("abc", "abcd")).toBe(false);
  });

  it("returns false for different values of same length", () => {
    expect(timingSafeEqualHex("aaaa", "aaab")).toBe(false);
  });
});

describe("timingSafeEqualAny", () => {
  it("matches one of several allowed secrets", () => {
    expect(timingSafeEqualAny("secret-b", ["secret-a", "secret-b"])).toBe(true);
  });

  it("rejects unknown secrets", () => {
    expect(timingSafeEqualAny("nope", ["secret-a"])).toBe(false);
  });
});
