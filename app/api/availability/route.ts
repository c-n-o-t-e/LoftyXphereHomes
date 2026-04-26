import { NextRequest, NextResponse } from "next/server";
import { getBookingsForApartment } from "@/lib/cache/availability-data";
import { parseSearchParams } from "@/lib/validation/http";
import { availabilityQuerySchema } from "@/lib/validation/schemas";

/**
 * Helper to format date as YYYY-MM-DD (date-only, stable across server TZ)
 *
 * We intentionally use the UTC date part (`toISOString().slice(0, 10)`) so that:
 * - DB-stored date-only values remain consistent regardless of server timezone
 * - Clients can safely treat the returned strings as calendar dates (YYYY-MM-DD)
 */
function formatDateOnly(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date value: ${String(date)}`);
  }
  return d.toISOString().slice(0, 10);
}

function parseDateOnly(iso: string): Date {
  // Force UTC midnight to avoid timezone drift.
  return new Date(`${iso}T00:00:00.000Z`);
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
    const bookings = await getBookingsForApartment(apartmentId);

    // Build blocked dates (check-in date through checkout-1)
    // Example: booking 11th→15th blocks check-in on 11th, 12th, 13th, 14th
    const blockedDates = new Set<string>();
    const bookingRanges: { checkIn: string; checkOut: string }[] = [];

    for (const booking of bookings) {
      const checkInStr = formatDateOnly(booking.checkIn);
      const checkOutStr = formatDateOnly(booking.checkOut);
      bookingRanges.push({ checkIn: checkInStr, checkOut: checkOutStr });

      // Block all dates from checkIn to checkOut-1 (the nights occupied)
      const current = parseDateOnly(checkInStr);
      const checkOutDate = parseDateOnly(checkOutStr);
      while (current < checkOutDate) {
        blockedDates.add(formatDateOnly(current));
        current.setUTCDate(current.getUTCDate() + 1);
      }
    }

    bookingRanges.sort((a, b) => a.checkIn.localeCompare(b.checkIn));

    return NextResponse.json(
      {
        apartmentId,
        blockedDates: Array.from(blockedDates).sort(),
        bookingRanges,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
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
