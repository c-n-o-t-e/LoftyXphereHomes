import {
  initializePayment,
  verifyTransactionByReference,
  initiateRefund as flutterwaveInitiateRefund,
} from "@/lib/flutterwave";
import { totalNgnToKobo } from "@/lib/pricing";
import type {
  InitializeCheckoutInput,
  InitializeCheckoutResult,
  PaymentProviderAdapter,
  VerifiedPayment,
} from "@/lib/payments/types";
import type { FlutterwaveVerifyData } from "@/lib/flutterwave";

function mapFlutterwaveStatus(
  status: string,
): VerifiedPayment["status"] {
  const normalized = status.toLowerCase();
  if (normalized === "successful" || normalized === "success") return "success";
  if (normalized === "failed") return "failed";
  return "abandoned";
}

function mapFlutterwaveToVerified(data: FlutterwaveVerifyData): VerifiedPayment {
  return {
    reference: data.tx_ref,
    provider: "flutterwave",
    status: mapFlutterwaveStatus(data.status),
    amountMinor: totalNgnToKobo(data.amount),
    metadata: {
      apartment_id: String(data.meta?.apartment_id ?? ""),
      check_in: String(data.meta?.check_in ?? ""),
      check_out: String(data.meta?.check_out ?? ""),
      booker_name: data.meta?.booker_name,
      booker_phone: data.meta?.booker_phone,
    },
    customerEmail: data.customer?.email,
    providerTransactionId: String(data.id),
  };
}

export const flutterwaveProvider: PaymentProviderAdapter = {
  id: "flutterwave",

  async initializeCheckout(
    input: InitializeCheckoutInput,
  ): Promise<InitializeCheckoutResult> {
    const result = await initializePayment({
      txRef: input.reference,
      amountNgn: input.amountNgn,
      email: input.email,
      name: input.name,
      phone: input.phone,
      redirectUrl: input.callbackUrl,
      meta: {
        apartment_id: input.apartmentId,
        check_in: input.checkIn,
        check_out: input.checkOut,
        booker_name: input.name?.trim() || undefined,
        booker_phone: input.phone?.trim() || undefined,
      },
    });

    if (result.status !== "success" || !result.data?.link) {
      throw new Error(result.message || "Failed to initialize Flutterwave payment");
    }

    return {
      authorizationUrl: result.data.link,
      reference: input.reference,
    };
  },

  async verifyPayment(reference: string): Promise<VerifiedPayment | null> {
    const result = await verifyTransactionByReference(reference);
    if (!result || result.status !== "success" || !result.data) return null;
    return mapFlutterwaveToVerified(result.data);
  },

  async initiateRefund(args) {
    const transactionId = args.providerTransactionId;
    if (!transactionId) {
      return {
        ok: false,
        message: "Flutterwave transaction id is required for refunds",
      };
    }

    const refund = await flutterwaveInitiateRefund({
      transactionId,
      amountNgn: Math.round(args.amountMinor / 100),
    });
    return {
      ok: refund.ok,
      data: refund.data,
      message: refund.message,
    };
  },
};
