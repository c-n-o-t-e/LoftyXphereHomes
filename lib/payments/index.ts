import type { PaymentProvider } from "@/lib/generated/prisma/client";
import { isFlutterwaveConfigured } from "@/lib/flutterwave";
import { paystackProvider } from "@/lib/payments/providers/paystack";
import { flutterwaveProvider } from "@/lib/payments/providers/flutterwave";
import type { PaymentProviderAdapter, PaymentProviderId } from "@/lib/payments/types";

const providers: Record<PaymentProviderId, PaymentProviderAdapter> = {
  paystack: paystackProvider,
  flutterwave: flutterwaveProvider,
};

export function getPaymentProvider(id: PaymentProviderId): PaymentProviderAdapter {
  return providers[id];
}

export function dbPaymentProviderToId(
  provider: PaymentProvider,
): PaymentProviderId {
  return provider === "FLUTTERWAVE" ? "flutterwave" : "paystack";
}

export function paymentProviderIdToDb(
  id: PaymentProviderId,
): PaymentProvider {
  return id === "flutterwave" ? "FLUTTERWAVE" : "PAYSTACK";
}

export function resolveProviderFromBooking(booking: {
  paymentProvider: PaymentProvider;
}): PaymentProviderAdapter {
  return getPaymentProvider(dbPaymentProviderToId(booking.paymentProvider));
}

export function getAvailablePaymentProviders(): PaymentProviderId[] {
  const available: PaymentProviderId[] = [];
  if (process.env.PAYSTACK_SECRET_KEY?.trim()) {
    available.push("paystack");
  }
  if (isFlutterwaveConfigured()) {
    available.push("flutterwave");
  }
  return available;
}

export { paystackProvider, flutterwaveProvider };
