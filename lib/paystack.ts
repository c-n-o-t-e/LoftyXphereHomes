import crypto from "crypto";

const PAYSTACK_VERIFY = "https://api.paystack.co/transaction/verify";

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
