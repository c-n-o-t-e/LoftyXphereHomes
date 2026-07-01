import { timingSafeEqualHex } from "@/lib/security/timing";
import {
  buildE2eFlutterwaveVerifyResponse,
  isE2eFlutterwaveMockEnabled,
} from "@/lib/flutterwave/e2eMock";

const FLUTTERWAVE_BASE = "https://api.flutterwave.com/v3";

export interface FlutterwaveVerifyData {
  id: number;
  tx_ref: string;
  flw_ref?: string;
  status: string;
  amount: number;
  currency: string;
  meta?: {
    apartment_id?: string;
    check_in?: string;
    check_out?: string;
    booker_name?: string;
    booker_phone?: string;
  };
  customer?: { email?: string };
}

export interface FlutterwaveVerifyResponse {
  status: string;
  message?: string;
  data?: FlutterwaveVerifyData;
}

export interface FlutterwaveInitializeResponse {
  status: string;
  message?: string;
  data?: {
    link?: string;
  };
}

export interface FlutterwaveRefundResult {
  ok: boolean;
  data?: unknown;
  message?: string;
}

export async function verifyTransactionByReference(
  txRef: string,
): Promise<FlutterwaveVerifyResponse | null> {
  if (isE2eFlutterwaveMockEnabled()) {
    const mocked = buildE2eFlutterwaveVerifyResponse(txRef);
    if (mocked) return mocked;
  }

  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) return null;

  const res = await fetch(
    `${FLUTTERWAVE_BASE}/transactions/verify_by_reference?tx_ref=${encodeURIComponent(txRef)}`,
    {
      headers: { Authorization: `Bearer ${secretKey}` },
    },
  );
  const json: FlutterwaveVerifyResponse = await res.json();
  return json;
}

export function verifyWebhookHash(hash: string): boolean {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  if (!secretHash) return false;
  return timingSafeEqualHex(hash, secretHash);
}

export async function initializePayment(args: {
  txRef: string;
  amountNgn: number;
  email: string;
  name: string;
  phone: string;
  redirectUrl: string;
  meta: Record<string, string | undefined>;
}): Promise<FlutterwaveInitializeResponse> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) {
    return { status: "error", message: "Flutterwave is not configured" };
  }

  const res = await fetch(`${FLUTTERWAVE_BASE}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: args.txRef,
      amount: args.amountNgn,
      currency: "NGN",
      redirect_url: args.redirectUrl,
      customer: {
        email: args.email,
        name: args.name,
        phonenumber: args.phone,
      },
      meta: args.meta,
      customizations: {
        title: "LoftyXphereHomes",
        description: "Apartment booking payment",
      },
    }),
  });

  return (await res.json()) as FlutterwaveInitializeResponse;
}

export async function initiateRefund(args: {
  transactionId: string;
  amountNgn?: number;
}): Promise<FlutterwaveRefundResult> {
  const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  if (!secretKey) {
    return { ok: false, message: "Flutterwave is not configured" };
  }

  const body: { amount?: number } = {};
  if (typeof args.amountNgn === "number") {
    body.amount = args.amountNgn;
  }

  try {
    const res = await fetch(
      `${FLUTTERWAVE_BASE}/transactions/${encodeURIComponent(args.transactionId)}/refund`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
    const json = (await res.json()) as {
      status?: string;
      message?: string;
      data?: unknown;
    };

    if (!res.ok || json.status !== "success") {
      return {
        ok: false,
        message: json.message || "Flutterwave refund request failed",
        data: json.data,
      };
    }

    return { ok: true, data: json.data, message: json.message };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Flutterwave refund request failed";
    return { ok: false, message };
  }
}

export function isFlutterwaveConfigured(): boolean {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY?.trim());
}
