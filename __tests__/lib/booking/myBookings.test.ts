import { myBookingsWhereForUser } from "@/lib/booking/myBookings";

describe("myBookingsWhereForUser", () => {
  it("includes linked userId and unlinked email matches", () => {
    const where = myBookingsWhereForUser({
      id: "user-123",
      email: "guest@example.com",
    });

    expect(where.status).toEqual({ in: ["PAID", "PENDING"] });
    expect(where.OR).toEqual(
      expect.arrayContaining([
        { userId: "user-123" },
        { userId: null, bookerEmail: "guest@example.com" },
      ]),
    );
  });
});
