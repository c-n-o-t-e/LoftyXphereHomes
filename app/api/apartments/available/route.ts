import { NextRequest, NextResponse } from "next/server";
import { apartments } from "@/lib/data/apartments";
import { getOverlappingBookingsCached } from "@/lib/cache/availability-data";
import { parseSearchParams } from "@/lib/validation/http";
import { availableApartmentsQuerySchema } from "@/lib/validation/schemas";

/**
 * GET /api/apartments/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD&guests=N
 *
 * Returns list of apartment IDs that are available for the given date range.
 * An apartment is available if it has NO overlapping bookings (PAID or PENDING).
 *
 * Overlap logic: A booking overlaps if existingCheckIn < requestedCheckOut AND existingCheckOut > requestedCheckIn
 *
 * Example:
 * - Bob books ApartmentHappy 14th→19th
 * - Search 11th→13th: Available (no overlap)
 * - Search 15th→17th: NOT available (overlaps with 14th→19th)
 * - Search 19th→22nd: Available (Bob checks out 19th, new guest can check in)
 */
export async function GET(request: NextRequest) {
  const parsedQuery = parseSearchParams(request, availableApartmentsQuerySchema);
  if (!parsedQuery.success) {
    return parsedQuery.response;
  }

  const { checkIn, checkOut, guests } = parsedQuery.data;

  try {
    const requestedCheckIn = new Date(checkIn);
    const requestedCheckOut = new Date(checkOut);

    // Find all bookings that overlap with the requested date range (cached on server)
    const overlappingBookings = await getOverlappingBookingsCached(
      requestedCheckIn.toISOString(),
      requestedCheckOut.toISOString()
    );

    // Get set of apartment IDs that are booked (unavailable)
    const bookedApartmentIds = new Set(
      overlappingBookings.map((b) => b.apartmentId)
    );

    // Filter to get available apartments
    let availableApartments = apartments.filter(
      (apt) => !bookedApartmentIds.has(apt.id)
    );

    // Filter by guest capacity if specified
    if (guests && guests > 0) {
      availableApartments = availableApartments.filter(
        (apt) => apt.capacity >= guests
      );
    }

    const availableIds = availableApartments.map((apt) => apt.id);

    return NextResponse.json(
      {
        availableApartmentIds: availableIds,
        checkIn,
        checkOut,
        guests,
        totalAvailable: availableIds.length,
        totalBooked: bookedApartmentIds.size,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Error checking apartment availability:", error);
    // Booking engine safety: fail CLOSED (unknown availability => not available).
    return NextResponse.json(
      {
        availableApartmentIds: [],
        checkIn,
        checkOut,
        guests,
        totalAvailable: 0,
        error:
          "Availability is temporarily unavailable. Please retry before booking.",
        code: "AVAILABILITY_UNAVAILABLE",
      },
      { status: 503 }
    );
  }
}
