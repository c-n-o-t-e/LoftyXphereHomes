import { upsertBookingFromPaystack } from "@/lib/booking";
import { computeBookingQuote, totalNgnToKobo } from "@/lib/pricing";
import type { PaystackVerifyData } from "@/lib/paystack";

jest.mock("@/lib/db", () => ({
  prisma: {
    booking: {
      upsert: jest.fn().mockResolvedValue({ id: "bk_1", apartmentId: "lofty-horizon-suite" }),
    },
  },
}));

const { prisma } = require("@/lib/db");

describe("upsertBookingFromPaystack", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("rejects non-successful Paystack transactions", async () => {
    const data: PaystackVerifyData = {
      reference: "ref_failed",
      status: "failed",
      amount: 100_00,
      metadata: {
        apartment_id: "lofty-horizon-suite",
        check_in: "2026-03-20",
        check_out: "2026-03-24",
      },
      customer: { email: "a@b.com" },
    };

    await expect(upsertBookingFromPaystack(data)).rejects.toThrow(
      /non-successful Paystack transaction/
    );
    expect(prisma.booking.upsert).not.toHaveBeenCalled();
  });

  it("rejects when Paystack amount does not match server-computed price", async () => {
    const checkIn = "2026-03-20";
    const checkOut = "2026-03-24";
    const quote = computeBookingQuote(100_000, checkIn, checkOut);
    expect(quote).not.toBeNull();
    const wrongKobo = totalNgnToKobo(quote!.totalNgn) - 100;

    const data: PaystackVerifyData = {
      reference: "ref_test",
      status: "success",
      amount: wrongKobo,
      metadata: {
        apartment_id: "lofty-horizon-suite",
        check_in: checkIn,
        check_out: checkOut,
      },
      customer: { email: "a@b.com" },
    };

    await expect(upsertBookingFromPaystack(data)).rejects.toThrow(/Payment amount does not match/);
    expect(prisma.booking.upsert).not.toHaveBeenCalled();
  });

  it("persists booking when amount matches quoted total", async () => {
    const checkIn = "2026-03-20";
    const checkOut = "2026-03-24";
    const quote = computeBookingQuote(100_000, checkIn, checkOut);
    expect(quote).not.toBeNull();
    const kobo = totalNgnToKobo(quote!.totalNgn);

    const data: PaystackVerifyData = {
      reference: "ref_ok",
      status: "success",
      amount: kobo,
      metadata: {
        apartment_id: "lofty-horizon-suite",
        check_in: checkIn,
        check_out: checkOut,
      },
      customer: { email: "a@b.com" },
    };

    await upsertBookingFromPaystack(data);
    expect(prisma.booking.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.booking.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ status: "PAID" }),
        update: expect.objectContaining({ status: "PAID" }),
      })
    );
  });
});
