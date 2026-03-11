import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_BASE = "https://api.paystack.co";

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json(
      { error: "Paystack is not configured" },
      { status: 500 }
    );
  }

  let body: {
    email: string;
    amount: number; // total in NGN (will convert to kobo)
    apartmentId: string;
    checkIn: string;
    checkOut: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { email, amount, apartmentId, checkIn, checkOut } = body;
  if (!email || typeof amount !== "number" || amount < 100 || !apartmentId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "Missing or invalid email, amount, apartmentId, checkIn, or checkOut" },
      { status: 400 }
    );
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
