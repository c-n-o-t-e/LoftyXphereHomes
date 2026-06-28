import { getActiveApartments } from "@/lib/data/apartments";
import { getOverlappingBookings } from "@/lib/cache/availability-data";

/**
 * Returns apartment IDs available for [checkIn, checkOut) with optional guest filter.
 * Shared by the availability API and server-rendered book landing.
 */
export async function getAvailableApartmentIds(
    checkIn: string,
    checkOut: string,
    guests = 1,
): Promise<string[]> {
    const requestedCheckIn = new Date(checkIn);
    const requestedCheckOut = new Date(checkOut);

    const overlappingBookings = await getOverlappingBookings(
        requestedCheckIn.toISOString(),
        requestedCheckOut.toISOString(),
    );

    const bookedApartmentIds = new Set(
        overlappingBookings.map((b) => b.apartmentId),
    );

    let availableApartments = getActiveApartments().filter(
        (apt) => !bookedApartmentIds.has(apt.id),
    );

    if (guests > 0) {
        availableApartments = availableApartments.filter(
            (apt) => apt.capacity >= guests,
        );
    }

    return availableApartments.map((apt) => apt.id);
}
