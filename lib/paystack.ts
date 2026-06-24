import crypto from "crypto";

const PAYSTACK_VERIFY = "https://api.paystack.co/transaction/verify";
const PAYSTACK_REFUND = "https://api.paystack.co/refund";

export interface PaystackVerifyData {
  reference: string;
  status: "success" | "failed" | "abandoned";
  amount: number; // kobo
  metadata?: {
    apartment_id?: string;
    check_in?: string;
    check_out?: string;
    booker_name?: string;
    booker_phone?: string;
  };
  customer?: { email?: string };
}

export interface PaystackVerifyResponse {
  status: boolean;
  data?: PaystackVerifyData;
  message?: string;
}

export async function verifyTransaction(
  reference: string
): Promise<PaystackVerifyResponse | null> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return null;

  const res = await fetch(`${PAYSTACK_VERIFY}/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const json: PaystackVerifyResponse = await res.json();
  return json;
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return false;
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

export interface PaystackRefundResult {
  ok: boolean;
  data?: unknown;
  message?: string;
}

export async function initiateRefund(args: {
  transaction: string;
  amount?: number;
}): Promise<PaystackRefundResult> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return { ok: false, message: "Paystack is not configured" };
  }

  const body: { transaction: string; amount?: number } = {
    transaction: args.transaction,
  };
  if (typeof args.amount === "number") {
    body.amount = args.amount;
  }

  try {
    const res = await fetch(PAYSTACK_REFUND, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json()) as {
      status?: boolean;
      message?: string;
      data?: unknown;
    };

    if (!res.ok || !json.status) {
      return {
        ok: false,
        message: json.message || "Paystack refund request failed",
        data: json.data,
      };
    }

    return { ok: true, data: json.data, message: json.message };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Paystack refund request failed";
    return { ok: false, message };
  }
}
