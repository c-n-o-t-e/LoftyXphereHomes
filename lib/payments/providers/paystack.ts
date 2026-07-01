import {
  verifyTransaction as paystackVerifyTransaction,
  initiateRefund as paystackInitiateRefund,
  type PaystackVerifyData,
} from "@/lib/paystack";
import { totalNgnToKobo } from "@/lib/pricing";
import type {
  InitializeCheckoutInput,
  InitializeCheckoutResult,
  PaymentProviderAdapter,
  VerifiedPayment,
} from "@/lib/payments/types";

const PAYSTACK_BASE = "https://api.paystack.co";

function mapPaystackToVerified(data: PaystackVerifyData): VerifiedPayment {
  return {
    reference: data.reference,
    provider: "paystack",
    status: data.status,
    amountMinor: data.amount,
    metadata: {
      apartment_id: String(data.metadata?.apartment_id ?? ""),
      check_in: String(data.metadata?.check_in ?? ""),
      check_out: String(data.metadata?.check_out ?? ""),
      booker_name: data.metadata?.booker_name,
      booker_phone: data.metadata?.booker_phone,
    },
    customerEmail: data.customer?.email,
  };
}

export const paystackProvider: PaymentProviderAdapter = {
  id: "paystack",

  async initializeCheckout(
    input: InitializeCheckoutInput,
  ): Promise<InitializeCheckoutResult> {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Paystack is not configured");
    }

    const amountInKobo = totalNgnToKobo(input.amountNgn);
    const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: input.email.trim(),
        amount: amountInKobo,
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: {
          apartment_id: input.apartmentId,
          check_in: input.checkIn,
          check_out: input.checkOut,
          booker_name: input.name?.trim() || undefined,
          booker_phone: input.phone?.trim() || undefined,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.status || !data.data?.authorization_url) {
      throw new Error(data.message || "Failed to initialize Paystack payment");
    }

    return {
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference ?? input.reference,
    };
  },

  async verifyPayment(reference: string): Promise<VerifiedPayment | null> {
    const result = await paystackVerifyTransaction(reference);
    if (!result?.status || !result.data) return null;
    return mapPaystackToVerified(result.data);
  },

  async initiateRefund(args) {
    const refund = await paystackInitiateRefund({
      transaction: args.reference,
      amount: args.amountMinor,
    });
    return {
      ok: refund.ok,
      data: refund.data,
      message: refund.message,
    };
  },
};
