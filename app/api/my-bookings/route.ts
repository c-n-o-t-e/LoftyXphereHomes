import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { PrismaClient } from "@/lib/generated/prisma/client";
import { parseHeaders, parseSearchParams } from "@/lib/validation/http";
import {
  bearerAuthHeaderSchema,
  myBookingsQuerySchema,
} from "@/lib/validation/schemas";

const BOOKING_LIST_SELECT = {
  id: true,
  reference: true,
  apartmentId: true,
  checkIn: true,
  checkOut: true,
  nights: true,
  amountPaid: true,
  status: true,
  bookerName: true,
  createdAt: true,
  userId: true,
} as const;

/**
 * GET /api/my-bookings?limit=50&cursor=<bookingId>
 * Returns paginated bookings for the authenticated user (by email).
 */
export async function GET(request: NextRequest) {
  const parsedHeaders = parseHeaders(request, bearerAuthHeaderSchema);
  if (!parsedHeaders.success) {
    return parsedHeaders.response;
  }
  const parsedQuery = parseSearchParams(request, myBookingsQuerySchema);
  if (!parsedQuery.success) {
    return parsedQuery.response;
  }
  const { limit, cursor } = parsedQuery.data;

  const token = parsedHeaders.data.authorization.replace(/^Bearer\s+/i, "");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Server configuration error", details: "Missing Supabase env vars" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user?.email) {
    return NextResponse.json(
      {
        error: "Invalid token",
        details: authError?.message || "No user email found",
      },
      { status: 401 }
    );
  }

  try {
    const { prisma } = await import("@/lib/db");

    const bookings = await prisma.booking.findMany({
      where: {
        bookerEmail: user.email,
        status: { in: ["PAID", "PENDING"] },
      },
      orderBy: [{ checkIn: "desc" }, { id: "desc" }],
      take: limit + 1,
      ...(cursor
        ? {
            cursor: { id: cursor },
            skip: 1,
          }
        : {}),
      select: BOOKING_LIST_SELECT,
    });

    const hasMore = bookings.length > limit;
    const page = hasMore ? bookings.slice(0, limit) : bookings;
    const nextCursor = hasMore ? page[page.length - 1]?.id ?? null : null;

    void linkBookingsToUser(prisma as PrismaClient, user.id, page).catch((err) => {
      console.warn("Background userId link skipped:", err);
    });

    const privateHeaders = {
      "Cache-Control": "private, no-store",
    };

    return NextResponse.json(
      { bookings: page, nextCursor },
      { headers: privateHeaders }
    );
  } catch (err) {
    console.error("Error fetching bookings:", err);

    const errorMessage = err instanceof Error ? err.message : "Unknown error";

    if (errorMessage.includes("TLS") || errorMessage.includes("certificate")) {
      return NextResponse.json(
        {
          error: "Database connection error",
          details: "SSL/TLS certificate issue. Check DATABASE_URL configuration.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch bookings", details: errorMessage },
      { status: 500 }
    );
  }
}

async function linkBookingsToUser(
  prisma: PrismaClient,
  userId: string,
  bookings: { id: string; userId: string | null }[]
) {
  const bookingIdsToLink = bookings.filter((b) => !b.userId).map((b) => b.id);

  if (bookingIdsToLink.length === 0) return;

  await prisma.booking.updateMany({
    where: { id: { in: bookingIdsToLink } },
    data: { userId },
  });
}
