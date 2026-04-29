import { buildCheckoutDisabledDates } from "@/lib/booking/checkoutDisabledDates";

describe("buildCheckoutDisabledDates", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 3, 29));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("allows checkout on the next booking check-in date but disables dates after it", () => {
    const disabled = buildCheckoutDisabledDates("2026-04-30", [
      { checkIn: "2026-05-03", checkOut: "2026-05-08" },
    ]);

    expect(disabled).not.toContain("2026-05-01");
    expect(disabled).not.toContain("2026-05-02");
    expect(disabled).not.toContain("2026-05-03");
    expect(disabled).toContain("2026-05-04");
    expect(disabled).toContain("2026-07-01");
  });

  it("does not cap checkout when there is no later booking", () => {
    expect(
      buildCheckoutDisabledDates("2026-04-30", [
        { checkIn: "2026-04-20", checkOut: "2026-04-25" },
      ])
    ).toEqual([]);
  });
});
