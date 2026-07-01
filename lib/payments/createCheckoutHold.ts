import { randomBytes } from "crypto";
import { getApartmentById, isApartmentBookable } from "@/lib/data/apartments";
import {
  bookingHoldExpiresAt,
  findOverlappingBooking,
  withApartmentBookingTransaction,
} from "@/lib/booking/conflict";
import { formatBookingConflictMessage } from "@/lib/booking";
import { computeBookingQuote, nightsBetweenStayDates } from "@/lib/pricing";
import { paymentProviderIdToDb } from "@/lib/payments";
import type { PaymentProviderId } from "@/lib/payments/types";

export function generateBookingReference(apartmentId: string): string {
  return `lxh_${apartmentId}_${Date.now()}_${randomBytes(8).toString("hex")}`.replace(
    /[^a-zA-Z0-9_-]/g,
    "_",
  );
}

export type CreateCheckoutHoldInput = {
  email: string;
  name: string;
  phone: string;
  apartmentId: string;
  checkIn: string;
  checkOut: string;
  paymentProvider: PaymentProviderId;
};

export type CreateCheckoutHoldResult =
  | {
      ok: true;
      reference: string;
      quote: NonNullable<ReturnType<typeof computeBookingQuote>>;
      apartment: NonNullable<ReturnType<typeof getApartmentById>>;
    }
  | {
      ok: false;
      status: number;
      error: string;
      code?: string;
    };

export async function createCheckoutHold(
  input: CreateCheckoutHoldInput,
): Promise<CreateCheckoutHoldResult> {
  const apartment = getApartmentById(input.apartmentId);
  if (!apartment) {
    return { ok: false, status: 404, error: "Apartment not found" };
  }

  if (!isApartmentBookable(apartment)) {
    return {
      ok: false,
      status: 400,
      error: "This suite is not available for booking yet.",
    };
  }

  const quote = computeBookingQuote(
    apartment.pricePerNight,
    input.checkIn,
    input.checkOut,
  );
  if (!quote) {
    return {
      ok: false,
      status: 400,
      error: "Invalid stay dates for pricing",
    };
  }

  if (quote.totalNgn < 100) {
    return {
      ok: false,
      status: 400,
      error: "Computed amount is below the minimum allowed for payment",
    };
  }

  const requestedCheckIn = new Date(input.checkIn);
  const requestedCheckOut = new Date(input.checkOut);
  const nights = nightsBetweenStayDates(input.checkIn, input.checkOut);
  const reference = generateBookingReference(input.apartmentId);

  try {
    const conflictingBooking = await withApartmentBookingTransaction(
      input.apartmentId,
      async (tx) => {
        const conflict = await findOverlappingBooking(tx, {
          apartmentId: input.apartmentId,
          checkIn: requestedCheckIn,
          checkOut: requestedCheckOut,
        });
        if (conflict) {
          return conflict;
        }

        await tx.booking.create({
          data: {
            reference,
            apartmentId: input.apartmentId,
            checkIn: requestedCheckIn,
            checkOut: requestedCheckOut,
            nights,
            amountPaid: quote.totalNgn,
            status: "PENDING",
            source: "WEBSITE",
            paymentProvider: paymentProviderIdToDb(input.paymentProvider),
            bookerEmail: input.email.trim(),
            bookerName: input.name?.trim() || null,
            bookerPhone: input.phone?.trim() || null,
            expiresAt: bookingHoldExpiresAt(),
          },
        });

        return null;
      },
    );

    if (conflictingBooking) {
      return {
        ok: false,
        status: 409,
        error: formatBookingConflictMessage(
          conflictingBooking.checkIn,
          conflictingBooking.checkOut,
        ),
      };
    }
  } catch (dbError) {
    console.error("Database error checking availability:", dbError);
    return {
      ok: false,
      status: 503,
      error:
        "Availability is temporarily unavailable. Please retry before booking.",
      code: "AVAILABILITY_UNAVAILABLE",
    };
  }

  return { ok: true, reference, quote, apartment };
}
