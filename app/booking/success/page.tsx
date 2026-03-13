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
  bookerName: string;
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
        await upsertBookingFromPaystack(result.data);
      } catch {
        verifyError = "Booking could not be saved (database not configured).";
      }
    } else if (result?.data?.status) {
      verifyError = "Payment was not successful.";
    } else {
      verifyError = result?.message ?? "Could not verify payment.";
    }
  }
  
  return (
    <div className="pt-24 pb-16 min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-black mb-2">Payment Successful</h1>
        <p className="text-black/70 mb-4">
          Thank you for your booking. Your stay is confirmed.
        </p>
        <p className="text-black/60 mb-6">
          Log in with the email you used for this reservation to view your booking details.
        </p>
        {verifyError && (
          <p className="mt-4 text-sm text-amber-700">{verifyError}</p>
        )}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="rounded-full bg-white text-[#FA5C5C] border border-[#FA5C5C] hover:bg-[#FA5C5C] hover:text-white hover:border-white h-12 px-6"
          >
            <Link href="/login?redirect=/my-bookings">Access My Dashboard</Link>
          </Button>
          <Button
            asChild
            className="rounded-full bg-[#FA5C5C] text-white border border-white hover:bg-white hover:text-[#FA5C5C] hover:border-[#FA5C5C] h-12 px-6"
            size="lg"
          >
            <Link href="/apartments">Browse more apartments</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
