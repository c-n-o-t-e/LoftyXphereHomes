import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyTransaction } from "@/lib/paystack";

export const metadata: Metadata = {
  title: "Booking Successful",
  description: "Your payment was successful. Thank you for booking with LoftyXphereHomes.",
};

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference: refParam } = await searchParams;
  const reference = typeof refParam === "string" ? refParam : Array.isArray(refParam) ? refParam[0] ?? "" : "";
  let verifyError: string | null = null;
  let didVerifyPaymentSuccess = false;
  let didPersistBooking = false;

  if (reference.trim()) {
    const result = await verifyTransaction(reference.trim());
    if (result?.status && result.data?.status === "success") {
      didVerifyPaymentSuccess = true;
      try {
        const { upsertBookingFromPaystack } = await import("@/lib/booking");
        await upsertBookingFromPaystack(result.data);
        didPersistBooking = true;
      } catch (error) {
        console.error("Booking payment verified but persistence failed", {
          reference: reference.trim(),
          error,
        });
        verifyError =
          "Payment was verified, but we could not save your booking. Please contact support with your payment reference.";
      }
    } else if (result?.data?.status) {
      verifyError = "Payment was not successful.";
    } else {
      verifyError = result?.message ?? "Could not verify payment.";
    }
  }
  
  const isConfirmed = didVerifyPaymentSuccess && didPersistBooking && !verifyError;
  const isPending = didVerifyPaymentSuccess && !didPersistBooking;
  const isFailed = Boolean(verifyError) && !isPending;

  const statusIcon = isConfirmed ? (
    <CheckCircle className="h-10 w-10 text-green-600" />
  ) : isPending ? (
    <AlertTriangle className="h-10 w-10 text-amber-600" />
  ) : (
    <XCircle className="h-10 w-10 text-red-600" />
  );

  const statusRingClass = isConfirmed
    ? "bg-green-100"
    : isPending
      ? "bg-amber-100"
      : "bg-red-100";

  return (
    <div className="pt-24 pb-16 min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className={`w-16 h-16 rounded-full ${statusRingClass} flex items-center justify-center mx-auto mb-6`}>
          {statusIcon}
        </div>
        <h1 className="text-2xl font-bold text-black mb-2">
          {isConfirmed
            ? "Your stay is confirmed"
            : isPending
              ? "Payment received — confirmation pending"
              : "We couldn’t confirm your booking"}
        </h1>
        <p className="text-black/70 mb-4">
          {isConfirmed
            ? "Thank you for your booking. We’re looking forward to hosting you."
            : isPending
              ? "We verified your payment, but we couldn’t save your booking yet. Please contact us so we can confirm your dates."
              : "We couldn’t verify and confirm this booking right now. Please contact us and include your payment reference."}
        </p>
        <p className="text-black/60 mb-6">
          Log in with the email you used for this reservation to view your booking details.
        </p>
        {verifyError && (
          <p className={`mt-4 text-sm ${isPending ? "text-amber-700" : "text-red-700"}`}>
            {verifyError}
          </p>
        )}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            asChild
            className="rounded-full bg-white text-[#FA5C5C] border border-[#FA5C5C] hover:bg-[#FA5C5C] hover:text-white hover:border-white h-12 px-6"
          >
            <Link href="/login?redirect=/my-bookings">Access My Dashboard</Link>
          </Button>
          {(isPending || isFailed) && (
            <Button
              asChild
              className="rounded-full bg-white text-black border border-black/15 hover:bg-black/5 h-12 px-6"
            >
              <Link
                href={`/contact?category=booking&message=${encodeURIComponent(
                  `Booking confirmation issue. Reference: ${reference || "(missing)"}. ${verifyError || ""}`.trim()
                )}`}
              >
                Contact support
              </Link>
            </Button>
          )}
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
