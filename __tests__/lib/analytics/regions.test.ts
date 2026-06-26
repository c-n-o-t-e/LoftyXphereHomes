import { isEeaOrUkCountry } from "@/lib/analytics/regions";

describe("isEeaOrUkCountry", () => {
  it("detects EU, EEA, UK, and Switzerland", () => {
    expect(isEeaOrUkCountry("DE")).toBe(true);
    expect(isEeaOrUkCountry("gb")).toBe(true);
    expect(isEeaOrUkCountry("NO")).toBe(true);
    expect(isEeaOrUkCountry("CH")).toBe(true);
  });

  it("does not flag Nigeria or other regions", () => {
    expect(isEeaOrUkCountry("NG")).toBe(false);
    expect(isEeaOrUkCountry("US")).toBe(false);
    expect(isEeaOrUkCountry("")).toBe(false);
    expect(isEeaOrUkCountry(undefined)).toBe(false);
  });
});
