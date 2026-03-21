import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import {
    AVAILABILITY_TAG,
    availabilityApartmentTag,
} from "@/lib/cache/constants";

const REVALIDATE_SECONDS = 60;

export type OverlapBookingRow = { apartmentId: string };

/**
 * Cached: all PAID/PENDING bookings overlapping [checkIn, checkOut).
 */
export function getOverlappingBookingsCached(
    checkInIso: string,
    checkOutIso: string,
): Promise<OverlapBookingRow[]> {
    const requestedCheckIn = new Date(checkInIso);
    const requestedCheckOut = new Date(checkOutIso);

    return unstable_cache(
        async () => {
            return prisma.booking.findMany({
                where: {
                    status: { in: ["PAID", "PENDING"] },
                    checkIn: { lt: requestedCheckOut },
                    checkOut: { gt: requestedCheckIn },
                },
                select: { apartmentId: true },
            });
        },
        ["availability-overlap", checkInIso, checkOutIso],
        { revalidate: REVALIDATE_SECONDS, tags: [AVAILABILITY_TAG] },
    )();
}

export type ApartmentBookingRow = {
    checkIn: Date;
    checkOut: Date;
};

/**
 * Cached bookings for one apartment (calendar / blocked dates).
 * Returns bookings for the given apartment that are PAID or PENDING.
 */
export function getBookingsForApartmentCached(
    apartmentId: string,
): Promise<ApartmentBookingRow[]> {
    return unstable_cache(
        async () => {
            return prisma.booking.findMany({
                where: {
                    apartmentId,
                    status: { in: ["PAID", "PENDING"] },
                },
                select: { checkIn: true, checkOut: true },
                orderBy: { checkIn: "asc" },
            });
        },
        ["availability-apartment", apartmentId],
        {
            revalidate: REVALIDATE_SECONDS,
            tags: [AVAILABILITY_TAG, availabilityApartmentTag(apartmentId)],
        },
    )();
}
