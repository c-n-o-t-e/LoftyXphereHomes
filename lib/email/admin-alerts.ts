import type { PaystackVerifyData } from "@/lib/paystack";

type ResendSendEmailPayload = {
  from: string;
  to: string[];
  subject: string;
  text: string;
};

function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function safeErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return safeStringify(err);
}

export async function sendAdminAlertBookingPersistenceFailed(args: {
  reference: string;
  paystackData?: PaystackVerifyData;
  error: unknown;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.ADMIN_ALERT_EMAIL?.trim();
  const from =
    process.env.ADMIN_ALERT_FROM?.trim() ||
    "LoftyXphereHomes Alerts <alerts@loftyxpherehomes.com>";

  if (!apiKey || !to) {
    console.error("Admin alert email not configured", {
      hasResendApiKey: Boolean(apiKey),
      hasAdminAlertEmail: Boolean(to),
      reference: args.reference,
      error: args.error,
    });
    return;
  }

  const subject = `Booking persistence failed (Paystack charge.success) — ${args.reference}`;
  const lines = [
    "A Paystack payment appears successful, but saving the booking failed.",
    "",
    `reference: ${args.reference}`,
    `error: ${safeErrorMessage(args.error)}`,
    "",
    "paystackData:",
    safeStringify(args.paystackData ?? null),
  ];

  const payload: ResendSendEmailPayload = {
    from,
    to: [to],
    subject,
    text: lines.join("\n"),
  };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // ignore
    }
    console.error("Failed to send admin alert email", {
      status: res.status,
      body,
      reference: args.reference,
    });
  }
}

