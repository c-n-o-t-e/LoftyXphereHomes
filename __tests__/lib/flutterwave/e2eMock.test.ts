import {
  buildE2eFlutterwaveReference,
  buildE2eFlutterwaveVerifyResponse,
  parseE2eFlutterwaveReference,
} from "@/lib/flutterwave/e2eMock";

describe("flutterwave e2e mock", () => {
  it("round-trips reference parsing", () => {
    const ref = buildE2eFlutterwaveReference({
      apartmentId: "horizon-suite",
      checkIn: "2026-05-01",
      checkOut: "2026-05-03",
    });
    expect(parseE2eFlutterwaveReference(ref)).toEqual({
      apartmentId: "horizon-suite",
      checkIn: "2026-05-01",
      checkOut: "2026-05-03",
    });
  });

  it("builds verify response with NGN amount", () => {
    const ref = buildE2eFlutterwaveReference({
      apartmentId: "horizon-suite",
      checkIn: "2026-05-01",
      checkOut: "2026-05-03",
    });
    const response = buildE2eFlutterwaveVerifyResponse(ref);
    expect(response?.status).toBe("success");
    expect(response?.data?.amount).toBeGreaterThan(0);
    expect(response?.data?.currency).toBe("NGN");
  });
});
