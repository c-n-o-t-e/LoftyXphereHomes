import { prisma } from "@/lib/db";
import { activeBookingStatusOrWhere } from "@/lib/booking/conflict";

export type OverlapBookingRow = { apartmentId: string };

/**
 * Direct read: all PAID/active-PENDING bookings overlapping [checkIn, checkOut).
 * Availability is booking-critical, so avoid stale server cache here.
 */
export async function getOverlappingBookings(
    checkInIso: string,
    checkOutIso: string,
): Promise<OverlapBookingRow[]> {
    const requestedCheckIn = new Date(checkInIso);
    const requestedCheckOut = new Date(checkOutIso);

    await prisma.booking.updateMany({
        where: {
            status: "PENDING",
            expiresAt: { lt: new Date() },
        },
        data: { status: "CANCELLED" },
    });

    return prisma.booking.findMany({
        where: {
            checkIn: { lt: requestedCheckOut },
            checkOut: { gt: requestedCheckIn },
            OR: activeBookingStatusOrWhere(),
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
 * Returns bookings for the given apartment that are PAID or active PENDING.
 */
export async function getBookingsForApartment(
    apartmentId: string,
): Promise<ApartmentBookingRow[]> {
    await prisma.booking.updateMany({
        where: {
            status: "PENDING",
            expiresAt: { lt: new Date() },
        },
        data: { status: "CANCELLED" },
    });

    return prisma.booking.findMany({
        where: {
            apartmentId,
            OR: activeBookingStatusOrWhere(),
        },
        select: { checkIn: true, checkOut: true },
        orderBy: { checkIn: "asc" },
    });
}
