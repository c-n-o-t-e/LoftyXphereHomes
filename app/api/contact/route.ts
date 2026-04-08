import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/validation/http";
import { contactMessageBodySchema } from "@/lib/validation/schemas";
import { prisma } from "@/lib/db";

type RateLimitEntry = { count: number; windowStartMs: number };
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5; // per IP per window
const rateLimit = new Map<string, RateLimitEntry>();

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return xff || realIp || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (!entry) {
    rateLimit.set(ip, { count: 1, windowStartMs: now });
    return false;
  }
  if (now - entry.windowStartMs > RATE_LIMIT_WINDOW_MS) {
    rateLimit.set(ip, { count: 1, windowStartMs: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  // Parse raw body first so honeypot can short-circuit even if other fields are invalid.
  let rawBody: unknown = null;
  try {
    rawBody = await request.json();
  } catch {
    // Fall through to standardized validation response.
  }

  if (
    rawBody &&
    typeof rawBody === "object" &&
    "website" in rawBody &&
    typeof (rawBody as any).website === "string" &&
    (rawBody as any).website.trim()
  ) {
    // Honeypot: bots often fill hidden fields. Humans should leave empty.
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Re-validate using the standardized validator (expects JSON again).
  // Since we've already read the stream, reuse `rawBody` here.
  const parsed = contactMessageBodySchema.safeParse(rawBody);
  if (!parsed.success) {
    // Reuse existing standardized error payload shape.
    const { validationErrorResponse } = await import("@/lib/validation/http");
    return validationErrorResponse(parsed.error);
  }
  const data = parsed.data;

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        error: "Too many requests. Please wait a few minutes and try again.",
        code: "RATE_LIMITED",
      },
      { status: 429 }
    );
  }

  try {
    const userAgent = request.headers.get("user-agent") ?? null;
    await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        category: data.category,
        message: data.message,
        ip: ip === "unknown" ? null : ip,
        userAgent,
      },
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("contact: failed to persist message", err);
    return NextResponse.json(
      {
        error: "We couldn’t send your message right now. Please try again later.",
        code: "CONTACT_DELIVERY_FAILED",
      },
      { status: 500 }
    );
  }
}

