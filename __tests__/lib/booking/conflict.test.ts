import {
    BOOKING_HOLD_TTL_MS,
    activeBookingOverlapWhere,
    activeBookingStatusOrWhere,
    bookingHoldExpiresAt,
    isExclusionConstraintViolation,
} from "@/lib/booking/conflict";

describe("booking conflict helpers", () => {
    it("uses a 5-minute checkout hold TTL", () => {
        expect(BOOKING_HOLD_TTL_MS).toBe(5 * 60 * 1000);
    });

    it("computes hold expiry from the provided timestamp", () => {
        const start = new Date("2026-06-01T12:00:00.000Z");
        const expiresAt = bookingHoldExpiresAt(start);
        expect(expiresAt.getTime() - start.getTime()).toBe(BOOKING_HOLD_TTL_MS);
    });

    it("builds overlap filters for PAID and active PENDING bookings", () => {
        const now = new Date("2026-06-01T12:00:00.000Z");
        expect(activeBookingStatusOrWhere(now)).toEqual([
            { status: "PAID" },
            { status: "PENDING", expiresAt: { gt: now } },
        ]);
    });

    it("includes apartment and date overlap in active booking queries", () => {
        const checkIn = new Date("2026-06-10T00:00:00.000Z");
        const checkOut = new Date("2026-06-13T00:00:00.000Z");
        const where = activeBookingOverlapWhere({
            apartmentId: "lofty-wuye-01",
            checkIn,
            checkOut,
            excludeReference: "ref_hold",
        });

        expect(where).toEqual(
            expect.objectContaining({
                apartmentId: "lofty-wuye-01",
                checkIn: { lt: checkOut },
                checkOut: { gt: checkIn },
                reference: { not: "ref_hold" },
                OR: expect.any(Array),
            }),
        );
    });

    it("detects postgres exclusion constraint violations", () => {
        expect(
            isExclusionConstraintViolation({
                code: "P2010",
                meta: { code: "23P01" },
            }),
        ).toBe(true);
        expect(
            isExclusionConstraintViolation(
                new Error('conflicting key value violates exclusion constraint "booking_no_overlap"'),
            ),
        ).toBe(true);
        expect(isExclusionConstraintViolation(new Error("other"))).toBe(false);
    });
});
