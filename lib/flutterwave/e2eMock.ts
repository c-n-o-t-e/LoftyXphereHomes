import { getApartmentById } from "@/lib/data/apartments";
import { computeBookingQuote } from "@/lib/pricing";
import type { FlutterwaveVerifyData, FlutterwaveVerifyResponse } from "@/lib/flutterwave";

/** Reference shape: e2e-fw:<apartmentId>:<checkIn>:<checkOut> */
const E2E_REFERENCE_PREFIX = "e2e-fw:";

export type E2eFlutterwaveBookingPayload = {
  apartmentId: string;
  checkIn: string;
  checkOut: string;
};

export function isE2eFlutterwaveMockEnabled(): boolean {
  return process.env.E2E_MOCK_FLUTTERWAVE === "true";
}

export function buildE2eFlutterwaveReference(
  payload: E2eFlutterwaveBookingPayload,
): string {
  return `${E2E_REFERENCE_PREFIX}${payload.apartmentId}:${payload.checkIn}:${payload.checkOut}`;
}

export function parseE2eFlutterwaveReference(
  reference: string,
): E2eFlutterwaveBookingPayload | null {
  if (!reference.startsWith(E2E_REFERENCE_PREFIX)) return null;

  const body = reference.slice(E2E_REFERENCE_PREFIX.length);
  const lastColon = body.lastIndexOf(":");
  const secondLastColon = body.lastIndexOf(":", lastColon - 1);
  if (lastColon <= 0 || secondLastColon <= 0) return null;

  const apartmentId = body.slice(0, secondLastColon);
  const checkIn = body.slice(secondLastColon + 1, lastColon);
  const checkOut = body.slice(lastColon + 1);

  if (!apartmentId || !checkIn || !checkOut) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkIn)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(checkOut)) return null;

  return { apartmentId, checkIn, checkOut };
}

export function buildE2eFlutterwaveVerifyResponse(
  reference: string,
): FlutterwaveVerifyResponse | null {
  const payload = parseE2eFlutterwaveReference(reference);
  if (!payload) return null;

  const apartment = getApartmentById(payload.apartmentId);
  if (!apartment) return null;

  const quote = computeBookingQuote(
    apartment.pricePerNight,
    payload.checkIn,
    payload.checkOut,
  );
  if (!quote) return null;

  const data: FlutterwaveVerifyData = {
    id: 999_001,
    tx_ref: reference,
    status: "successful",
    amount: quote.totalNgn,
    currency: "NGN",
    meta: {
      apartment_id: payload.apartmentId,
      check_in: payload.checkIn,
      check_out: payload.checkOut,
      booker_name: "E2E Guest",
      booker_phone: "+2348000000000",
    },
    customer: { email: "e2e-guest@example.com" },
  };

  return { status: "success", data };
}
