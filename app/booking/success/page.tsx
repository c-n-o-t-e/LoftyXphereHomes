import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyTransaction } from "@/lib/paystack";

export const metadata: Metadata = {
  title: "Booking Successful",
  description: "Your payment was successful. Thank you for booking with LoftyXphereHomes.",
};

type BookingResult = {
  id: string;
  apartmentId: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  amountPaid: number;
  bookerEmail: string;
};

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference: refParam } = await searchParams;
  const reference = typeof refParam === "string" ? refParam : Array.isArray(refParam) ? refParam[0] ?? "" : "";
  let booking: BookingResult | null = null;
  let verifyError: string | null = null;

  if (reference.trim()) {
    const result = await verifyTransaction(reference.trim());
    if (result?.status && result.data?.status === "success") {
      try {
        const { upsertBookingFromPaystack } = await import("@/lib/booking");
        const saved = await upsertBookingFromPaystack(result.data);
        booking = {
          id: saved.id,
          apartmentId: saved.apartmentId,
          checkIn: saved.checkIn,
          checkOut: saved.checkOut,
          nights: saved.nights,
          amountPaid: saved.amountPaid,
          bookerEmail: saved.bookerEmail,
        };
      } catch {
        verifyError = "Booking could not be saved (database not configured).";
      }
    } else if (result?.data?.status) {
      verifyError = "Payment was not successful.";
    } else {
      verifyError = result?.message ?? "Could not verify payment.";
    }
  }

  const formatPrice = (kobo: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo);

  return (
    <div className="pt-24 pb-16 min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-2">Payment Successful</h1>
        <p className="text-black/70 mb-6">
          Thank you for your booking. You will receive a confirmation email shortly with your
          reservation details.
        </p>
        {reference && (
          <p className="text-sm text-black/50 mb-2">Reference: {reference}</p>
        )}
        {booking && (
          <div className="mt-4 p-4 rounded-xl bg-black/5 border border-black/10 text-left text-sm text-black/80 space-y-2">
            <p><strong>Apartment:</strong> {booking.apartmentId}</p>
            <p><strong>Check-in:</strong> {booking.checkIn.toISOString().split("T")[0]}</p>
            <p><strong>Check-out:</strong> {booking.checkOut.toISOString().split("T")[0]}</p>
            <p><strong>Nights:</strong> {booking.nights}</p>
            <p><strong>Amount paid:</strong> {formatPrice(booking.amountPaid)}</p>
            <p><strong>Booker:</strong> {booking.bookerEmail}</p>
          </div>
        )}
        {verifyError && (
          <p className="mt-4 text-sm text-amber-700">{verifyError}</p>
        )}
        <div className="mt-8">
          <Button asChild className="rounded-full bg-[#FA5C5C] hover:bg-[#E84A4A] text-white" size="lg">
            <Link href="/apartments">Browse More Apartments</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
