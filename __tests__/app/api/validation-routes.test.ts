import type { NextRequest } from "next/server";

jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      async json() {
        return body;
      },
    }),
  },
}));

function expectValidation400(payload: any) {
  expect(payload).toEqual(
    expect.objectContaining({
      error: "Validation failed",
      details: expect.any(Array),
    })
  );
}

jest.mock("@/lib/paystack", () => ({
  verifyTransaction: jest.fn(),
  verifyWebhookSignature: jest.fn(),
}));

jest.mock("@/lib/booking", () => ({
  upsertBookingFromPaystack: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  prisma: {
    booking: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/supabase/server", () => ({
  inviteUserByEmail: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
  unstable_cache: (fn: unknown) => fn,
}));

const { GET: getAvailableApartments } = require("@/app/api/apartments/available/route");
const { GET: getMyBookings } = require("@/app/api/my-bookings/route");
const { POST: postPaystackWebhook } = require("@/app/api/paystack/webhook/route");
const { POST: postPaystackInitialize } = require("@/app/api/paystack/initialize/route");
const { verifyTransaction, verifyWebhookSignature } = require("@/lib/paystack");

type HeaderBag = {
  get: (name: string) => string | null;
  entries: () => IterableIterator<[string, string]>;
};

function makeHeaders(input?: Record<string, string>): HeaderBag {
  const normalized = new Map<string, string>();
  for (const [key, value] of Object.entries(input ?? {})) {
    normalized.set(key.toLowerCase(), value);
  }

  return {
    get: (name: string) => normalized.get(name.toLowerCase()) ?? null,
    entries: function* () {
      for (const entry of normalized.entries()) {
        yield entry;
      }
    },
  };
}

function makeNextRequest(
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string; throwOnJson?: boolean }
): NextRequest {
  const bodyText = init?.body ?? "";
  return {
    url,
    nextUrl: new URL(url),
    headers: makeHeaders(init?.headers),
    method: init?.method ?? "GET",
    async json() {
      if (init?.throwOnJson) {
        throw new Error("Invalid JSON");
      }
      return JSON.parse(bodyText);
    },
    async text() {
      return bodyText;
    },
  } as unknown as NextRequest;
}

describe("API validation integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns standardized 400 for invalid guests query", async () => {
    const request = makeNextRequest(
      "http://localhost/api/apartments/available?guests=abc"
    );
    const response = await getAvailableApartments(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expectValidation400(json);
  });

  it("returns standardized 400 when only one date is provided", async () => {
    const request = makeNextRequest(
      "http://localhost/api/apartments/available?checkIn=2026-03-20"
    );
    const response = await getAvailableApartments(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expectValidation400(json);
  });

  it("returns standardized 400 for missing bearer authorization header", async () => {
    const request = makeNextRequest("http://localhost/api/my-bookings");
    const response = await getMyBookings(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expectValidation400(json);
  });

  it("returns standardized 400 for non-bearer authorization header", async () => {
    const request = makeNextRequest("http://localhost/api/my-bookings", {
      headers: { authorization: "Basic abc" },
    });
    const response = await getMyBookings(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expectValidation400(json);
  });

  it("returns standardized 400 for charge.success webhook missing reference", async () => {
    (verifyWebhookSignature as jest.Mock).mockReturnValue(true);
    (verifyTransaction as jest.Mock).mockResolvedValue({
      status: true,
      data: { reference: "unused", status: "success", amount: 1000 },
    });

    const request = makeNextRequest("http://localhost/api/paystack/webhook", {
      method: "POST",
      headers: {
        "x-paystack-signature": "sig",
        "content-type": "application/json",
      },
      body: JSON.stringify({ event: "charge.success", data: {} }),
    });

    const response = await postPaystackWebhook(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expectValidation400(json);
    expect(verifyTransaction).not.toHaveBeenCalled();
  });

  it("returns 401 when webhook signature header is missing", async () => {
    const request = makeNextRequest("http://localhost/api/paystack/webhook", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ event: "charge.success", data: { reference: "ref_123" } }),
    });

    const response = await postPaystackWebhook(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual(expect.objectContaining({ error: expect.any(String) }));
  });

  it("returns 401 when webhook signature is invalid", async () => {
    (verifyWebhookSignature as jest.Mock).mockReturnValue(false);
    const request = makeNextRequest("http://localhost/api/paystack/webhook", {
      method: "POST",
      headers: { "x-paystack-signature": "sig" },
      body: JSON.stringify({ event: "charge.success", data: { reference: "ref_123" } }),
    });

    const response = await postPaystackWebhook(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual(expect.objectContaining({ error: expect.any(String) }));
  });

  it("returns 400 when webhook body is not valid JSON", async () => {
    (verifyWebhookSignature as jest.Mock).mockReturnValue(true);
    const request = makeNextRequest("http://localhost/api/paystack/webhook", {
      method: "POST",
      headers: { "x-paystack-signature": "sig" },
      body: "{not-json",
    });

    const response = await postPaystackWebhook(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json).toEqual(expect.objectContaining({ error: expect.any(String) }));
  });

  it("returns standardized 400 when initialize body is invalid JSON", async () => {
    process.env.PAYSTACK_SECRET_KEY = "sk_test_abc123";
    const request = makeNextRequest("http://localhost/api/paystack/initialize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{bad-json",
      throwOnJson: true,
    });

    const response = await postPaystackInitialize(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expectValidation400(json);
  });
});
