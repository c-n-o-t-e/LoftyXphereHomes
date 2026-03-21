import { NextRequest, NextResponse } from "next/server";
import { getBookingsForApartmentCached } from "@/lib/cache/availability-data";
import { parseSearchParams } from "@/lib/validation/http";
import { availabilityQuerySchema } from "@/lib/validation/schemas";

/**
 * Helper to format date as YYYY-MM-DD in local time (avoids timezone issues)
 */
function formatDateLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * GET /api/availability?apartmentId=xxx
 *
 * Returns booking information for the given apartment:
 * - blockedDates: Array of dates (YYYY-MM-DD) that are blocked for CHECK-IN
 * - bookingRanges: Array of {checkIn, checkOut} for existing bookings
 *
 * Blocking logic (Airbnb-style):
 * - If Bob books 11th→15th (4 nights), he occupies nights of 11th, 12th, 13th, 14th
 * - Blocked check-in dates: 11th, 12th, 13th, 14th
 * - First available check-in: 15th (Bob checks out that morning)
 */
export async function GET(request: NextRequest) {
  const parsedQuery = parseSearchParams(request, availabilityQuerySchema);
  if (!parsedQuery.success) {
    return parsedQuery.response;
  }
  const { apartmentId } = parsedQuery.data;

  try {
    const bookings = await getBookingsForApartmentCached(apartmentId);

    // Build blocked dates (check-in date through checkout-1)
    // Example: booking 11th→15th blocks check-in on 11th, 12th, 13th, 14th
    const blockedDates = new Set<string>();
    const bookingRanges: { checkIn: string; checkOut: string }[] = [];

    for (const booking of bookings) {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);

      const checkInStr = formatDateLocal(checkIn);
      const checkOutStr = formatDateLocal(checkOut);
      bookingRanges.push({ checkIn: checkInStr, checkOut: checkOutStr });

      // Block all dates from checkIn to checkOut-1 (the nights occupied)
      const current = new Date(checkIn);
      while (current < checkOut) {
        blockedDates.add(formatDateLocal(current));
        current.setDate(current.getDate() + 1);
      }
    }

    return NextResponse.json(
      {
        apartmentId,
        blockedDates: Array.from(blockedDates).sort(),
        bookingRanges,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
