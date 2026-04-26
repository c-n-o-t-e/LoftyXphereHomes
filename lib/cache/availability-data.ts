import { prisma } from "@/lib/db";

export type OverlapBookingRow = { apartmentId: string };

/**
 * Direct read: all PAID/PENDING bookings overlapping [checkIn, checkOut).
 * Availability is booking-critical, so avoid stale server cache here.
 */
export function getOverlappingBookings(
    checkInIso: string,
    checkOutIso: string,
): Promise<OverlapBookingRow[]> {
    const requestedCheckIn = new Date(checkInIso);
    const requestedCheckOut = new Date(checkOutIso);

    return prisma.booking.findMany({
        where: {
            status: { in: ["PAID", "PENDING"] },
            checkIn: { lt: requestedCheckOut },
            checkOut: { gt: requestedCheckIn },
        },
        select: { apartmentId: true },
    });
}

export type ApartmentBookingRow = {
    checkIn: Date;
    checkOut: Date;
};

/**
 * Direct read for one apartment (calendar / blocked dates).
 * Returns bookings for the given apartment that are PAID or PENDING.
 */
export function getBookingsForApartment(
    apartmentId: string,
): Promise<ApartmentBookingRow[]> {
    return prisma.booking.findMany({
        where: {
            apartmentId,
            status: { in: ["PAID", "PENDING"] },
        },
        select: { checkIn: true, checkOut: true },
        orderBy: { checkIn: "asc" },
    });
}
