import { NextRequest, NextResponse } from "next/server";
import { getAvailableApartmentIds } from "@/lib/availability/availableApartments";
import { getActiveApartments } from "@/lib/data/apartments";
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
    const availableIds = await getAvailableApartmentIds(checkIn, checkOut, guests);

    return NextResponse.json(
      {
        availableApartmentIds: availableIds,
        checkIn,
        checkOut,
        guests,
        totalAvailable: availableIds.length,
        totalBooked: getActiveApartments().length - availableIds.length,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
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
