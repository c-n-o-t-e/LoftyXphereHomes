import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/my-bookings
 * Returns all bookings for the authenticated user (by email).
 */
export async function GET(request: NextRequest) {
  // Get the auth token from the Authorization header
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized", details: "No bearer token" }, { status: 401 });
  }

  const token = authHeader.substring(7);

  // Verify the token with Supabase
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
    return NextResponse.json({ 
      error: "Invalid token", 
      details: authError?.message || "No user email found" 
    }, { status: 401 });
  }

  try {
    // Dynamically import prisma to handle connection errors gracefully
    const { prisma } = await import("@/lib/db");
    
    // Fetch all bookings for this user's email
    const bookings = await prisma.booking.findMany({
      where: {
        bookerEmail: user.email,
        status: { in: ["PAID", "PENDING"] },
      },
      orderBy: { checkIn: "desc" },
    });

    // Try to link bookings to user if not already linked (non-blocking)
    // This may fail if userId column doesn't exist yet in the database
    try {
      const bookingIdsToLink = bookings
        .filter((b) => !(b as { userId?: string }).userId)
        .map((b) => b.id);

      if (bookingIdsToLink.length > 0) {
        await prisma.booking.updateMany({
          where: { id: { in: bookingIdsToLink } },
          data: { userId: user.id },
        });
      }
    } catch (linkErr) {
      // userId field might not exist yet - ignore this error
      console.warn("Could not link bookings to user (userId field may not exist):", linkErr);
    }

    return NextResponse.json({ bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err);
    
    // Return more specific error for debugging
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    
    // Check for common database errors
    if (errorMessage.includes("TLS") || errorMessage.includes("certificate")) {
      return NextResponse.json(
        { error: "Database connection error", details: "SSL/TLS certificate issue. Check DATABASE_URL configuration." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch bookings", details: errorMessage },
      { status: 500 }
    );
  }
}
