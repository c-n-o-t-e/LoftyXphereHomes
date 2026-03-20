import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseJsonBody } from "@/lib/validation/http";
import { paystackInitializeBodySchema } from "@/lib/validation/schemas";

const PAYSTACK_BASE = "https://api.paystack.co";

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Paystack is not configured" },
      { status: 500 }
    );
  }

  const parsedBody = await parseJsonBody(request, paystackInitializeBodySchema);
  if (!parsedBody.success) {
    return parsedBody.response;
  }

  const { email, name, phone, amount, apartmentId, checkIn, checkOut } =
    parsedBody.data;

  // --- SERVER-SIDE DOUBLE-BOOKING PREVENTION ---
  // Check if any existing PAID or PENDING booking overlaps with the requested dates.
  // Overlap condition: existing.checkIn < requested.checkOut AND existing.checkOut > requested.checkIn
  try {
    const requestedCheckIn = new Date(checkIn);
    const requestedCheckOut = new Date(checkOut);

    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        apartmentId,
        status: { in: ["PAID", "PENDING"] },
        // Date ranges overlap if: existingCheckIn < requestedCheckOut AND existingCheckOut > requestedCheckIn
        checkIn: { lt: requestedCheckOut },
        checkOut: { gt: requestedCheckIn },
      },
      select: { id: true, checkIn: true, checkOut: true },
    });

    if (conflictingBooking) {
      const conflictStart = new Date(conflictingBooking.checkIn).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const conflictEnd = new Date(conflictingBooking.checkOut).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return NextResponse.json(
        {
          error: `This apartment is already booked from ${conflictStart} to ${conflictEnd}. Please select different dates.`,
        },
        { status: 409 }
      );
    }
  } catch (dbError) {
    console.error("Database error checking availability:", dbError);
    // Log but continue - Paystack webhook will do final validation
  }

  const amountInKobo = Math.round(amount * 100);
  const reference = `lxh_${apartmentId}_${Date.now()}`.replace(/[^a-zA-Z0-9_-]/g, "_");
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
  const callbackUrl = `${baseUrl}/booking/success?reference=${reference}`;

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.trim(),
      amount: amountInKobo,
      reference,
      callback_url: callbackUrl,
      metadata: {
        apartment_id: apartmentId,
        check_in: checkIn,
        check_out: checkOut,
        booker_name: name?.trim() || undefined,
        booker_phone: phone?.trim() || undefined,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data.message || "Failed to initialize payment" },
      { status: res.status >= 400 ? res.status : 500 }
    );
  }

  if (!data.status || !data.data?.authorization_url) {
    return NextResponse.json(
      { error: data.message || "Invalid response from Paystack" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    authorization_url: data.data.authorization_url,
    reference: data.data.reference,
  });
}
