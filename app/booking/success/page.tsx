import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, XCircle, ArrowRight, ShieldCheck, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyTransaction } from "@/lib/paystack";
import { upsertBookingFromPaystack } from "@/lib/booking";
import { sendAdminAlertBookingPersistenceFailed } from "@/lib/email/admin-alerts";
import {
  enqueuePostBookingJobs,
} from "@/lib/ops/bookingJobs";

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

  if (reference.trim()) {
    const result = await verifyTransaction(reference.trim());
    if (result?.status && result.data?.status === "success") {
      didVerifyPaymentSuccess = true;
      try {
        const booking = await upsertBookingFromPaystack(result.data);
        // Backup path: if Paystack webhook is not configured/reachable, still enqueue downstream work.
        // This is idempotent (bookingId+type unique + skipDuplicates).
        await enqueuePostBookingJobs(booking.id);
      } catch (error) {
        try {
          await sendAdminAlertBookingPersistenceFailed({
            reference: reference.trim(),
            paystackData: result.data,
            error,
          });
        } catch {
          // Ignore alert failures; payment verification is still successful.
        }
      }
    } else if (result?.data?.status) {
      verifyError = "Payment was not successful.";
    } else {
      verifyError = result?.message ?? "Could not verify payment.";
    }
  }
  
  const isConfirmed = didVerifyPaymentSuccess && !verifyError;
  const isFailed = !isConfirmed;

  const statusIcon = isConfirmed ? (
    <CheckCircle className="h-10 w-10 text-green-600" />
  ) : (
    <XCircle className="h-10 w-10 text-red-600" />
  );

  const statusRingClass = isConfirmed
    ? "bg-green-100"
    : "bg-red-100";

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 bg-linear-to-b from-gray-50 via-white to-white">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-8 sm:p-10 text-center">
            <div
              className={`w-16 h-16 rounded-full ${statusRingClass} flex items-center justify-center mx-auto mb-6`}
              aria-hidden="true"
            >
              {statusIcon}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {isConfirmed ? "Your stay is confirmed" : "We couldn’t confirm your booking"}
            </h1>

            <p className="text-gray-700 mb-6">
              {isConfirmed
                ? "Payment confirmed — your apartment is now reserved for your dates."
                : "We couldn’t verify and confirm this booking right now. Please contact us and include your payment reference."}
            </p>

            <p className="text-gray-600 mb-4">
              Log in with the email you used for this reservation to view your booking details.
            </p>

            {reference?.trim() && (
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-700">
                <ShieldCheck className="h-4 w-4 text-gray-500" aria-hidden="true" />
                <span className="font-medium">Reference</span>
                <span className="text-gray-500">•</span>
                <span className="font-mono">{reference.trim()}</span>
              </div>
            )}

            {isConfirmed && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 text-left">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-gray-600 mt-0.5" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-gray-900">Invoice & receipt</p>
                      <p className="text-sm text-gray-600 mt-1">
                        We’re generating your invoice in the background. It will show on your dashboard
                        once ready — with a download button.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">Next step</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Log in with the email you used for this reservation to view your booking details.
                  </p>
                </div>
              </div>
            )}

            {verifyError && (
              <p className="mt-6 text-sm text-red-700" role="alert">
                {verifyError}
              </p>
            )}

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Button asChild className="h-12 rounded-full px-6">
                <Link href="/login?redirect=/my-bookings">
                  Access My Dashboard <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>

              {isFailed && (
                <Button asChild variant="outline" className="h-12 rounded-full px-6">
                  <Link
                    href={`/contact?category=booking&message=${encodeURIComponent(
                      `Booking confirmation issue. Reference: ${reference || "(missing)"}. ${verifyError || ""}`.trim(),
                    )}`}
                  >
                    Contact support
                  </Link>
                </Button>
              )}

              <Button asChild variant="outline" className="h-12 rounded-full px-6">
                <Link href="/apartments">Browse more apartments</Link>
              </Button>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          For your security, confirmations and invoices are tied to the email used during checkout.
        </p>
      </div>
    </div>
  );
}
