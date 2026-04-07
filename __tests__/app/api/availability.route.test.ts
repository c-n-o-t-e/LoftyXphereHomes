import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      async json() {
        return body;
      },
    }),
  },
}));

jest.mock("@/lib/validation/http", () => ({
  // Pass-through for tests; we only validate behavior after successful parsing.
  parseSearchParams: (_req: unknown, _schema: unknown) => ({
    success: true,
    data: { apartmentId: "apt_1" },
  }),
}));

jest.mock("@/lib/cache/availability-data", () => ({
  getBookingsForApartmentCached: jest.fn(),
}));

const { GET } = require("@/app/api/availability/route");
const { getBookingsForApartmentCached } = require("@/lib/cache/availability-data");

function makeReq(url: string): NextRequest {
  return { url, nextUrl: new URL(url) } as unknown as NextRequest;
}

describe("GET /api/availability", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns blockedDates excluding checkout day", async () => {
    // Booking is 2026-04-08 -> 2026-04-17, so block 8..16
    (getBookingsForApartmentCached as jest.Mock).mockResolvedValueOnce([
      {
        checkIn: new Date("2026-04-08T00:00:00.000Z"),
        checkOut: new Date("2026-04-17T00:00:00.000Z"),
      },
    ]);

    const res = await GET(makeReq("http://localhost/api/availability?apartmentId=apt_1"));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual(
      expect.objectContaining({
        apartmentId: "apt_1",
        bookingRanges: [{ checkIn: "2026-04-08", checkOut: "2026-04-17" }],
      })
    );

    expect(json.blockedDates).toContain("2026-04-08");
    expect(json.blockedDates).toContain("2026-04-16");
    expect(json.blockedDates).not.toContain("2026-04-17");
  });
});

