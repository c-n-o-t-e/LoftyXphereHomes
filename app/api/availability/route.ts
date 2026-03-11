import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
  const { searchParams } = new URL(request.url);
  const apartmentId = searchParams.get("apartmentId");

  if (!apartmentId) {
    return NextResponse.json(
      { error: "apartmentId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Fetch all active bookings for this apartment
    const bookings = await prisma.booking.findMany({
      where: {
        apartmentId,
        status: { in: ["PAID", "PENDING"] },
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
      orderBy: {
        checkIn: "asc",
      },
    });

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

    return NextResponse.json({
      apartmentId,
      blockedDates: Array.from(blockedDates).sort(),
      bookingRanges,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
