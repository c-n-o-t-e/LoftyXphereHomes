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
  after: jest.fn((fn: () => void | Promise<void>) => {
    if (typeof fn === "function") fn();
  }),
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
      create: jest.fn(),
      updateMany: jest.fn(),
      upsert: jest.fn(),
    },
    adminUser: {
      findFirst: jest.fn(),
    },
    bookingJob: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/supabase/server", () => ({
  inviteUserByEmail: jest.fn(),
}));

jest.mock("@/lib/ops/bookingJobs", () => ({
  enqueuePostBookingJobs: jest.fn(),
  processPostBookingJobs: jest.fn(),
  flushPostBookingJobsForBooking: jest.fn(),
}));

jest.mock("@/lib/email/admin-alerts", () => ({
  sendAdminAlertBookingPersistenceFailed: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}));

jest.mock("@/lib/cache/availability-data", () => ({
  getOverlappingBookings: jest.fn(),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

const { GET: getAvailableApartments } = require("@/app/api/apartments/available/route");
const { GET: getMyBookings } = require("@/app/api/my-bookings/route");
const { POST: postAdminBooking } = require("@/app/api/admin/bookings/route");
const { POST: postPaystackWebhook } = require("@/app/api/paystack/webhook/route");
const { POST: postPaystackInitialize } = require("@/app/api/paystack/initialize/route");
const { verifyTransaction, verifyWebhookSignature } = require("@/lib/paystack");
const { sendAdminAlertBookingPersistenceFailed } = require("@/lib/email/admin-alerts");
const { getOverlappingBookings } = require("@/lib/cache/availability-data");
const { createClient } = require("@supabase/supabase-js");
const {
  enqueuePostBookingJobs,
  processPostBookingJobs,
  flushPostBookingJobsForBooking,
} = require("@/lib/ops/bookingJobs");

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

  it("fails closed with 503 when availability lookup errors", async () => {
    (getOverlappingBookings as jest.Mock).mockRejectedValueOnce(
      new Error("db down")
    );

    const request = makeNextRequest(
      "http://localhost/api/apartments/available?checkIn=2026-03-20&checkOut=2026-03-22&guests=2"
    );
    const response = await getAvailableApartments(request);
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json).toEqual(
      expect.objectContaining({
        availableApartmentIds: [],
        code: "AVAILABILITY_UNAVAILABLE",
        error: expect.any(String),
      })
    );
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

  it("does not leak auth internals for invalid token", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon_key";

    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "JWT expired; TLS handshake failed; DATABASE_URL=..." },
        }),
      },
    });

    const request = makeNextRequest("http://localhost/api/my-bookings", {
      headers: { authorization: "Bearer bad" },
    });
    const response = await getMyBookings(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual(
      expect.objectContaining({
        error: "Unauthorized",
        code: "UNAUTHORIZED",
      })
    );
    expect(JSON.stringify(json)).not.toMatch(/TLS|certificate|DATABASE_URL|JWT/i);
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

  it("enqueues post-booking jobs from a successful webhook (async processing)", async () => {
    (verifyWebhookSignature as jest.Mock).mockReturnValue(true);
    (verifyTransaction as jest.Mock).mockResolvedValue({
      status: true,
      data: {
        reference: "ref_123",
        status: "success",
        amount: 1000,
        metadata: {
          apartment_id: "lofty-wuye-01",
          check_in: "2026-01-01",
          check_out: "2026-01-02",
        },
        customer: { email: "guest@example.com" },
      },
    });

    const { upsertBookingFromPaystack } = require("@/lib/booking");
    (upsertBookingFromPaystack as jest.Mock).mockResolvedValueOnce({
      id: "booking_website_1",
      bookerEmail: null,
      status: "PAID",
    });

    const request = makeNextRequest("http://localhost/api/paystack/webhook", {
      method: "POST",
      headers: {
        "x-paystack-signature": "sig",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        event: "charge.success",
        data: { reference: "ref_123" },
      }),
    });

    const response = await postPaystackWebhook(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(expect.objectContaining({ received: true }));
    expect(enqueuePostBookingJobs).toHaveBeenCalledWith("booking_website_1");
    expect(flushPostBookingJobsForBooking).toHaveBeenCalledWith(
      "booking_website_1",
    );
    expect(processPostBookingJobs).not.toHaveBeenCalled();
  });

  it("sends admin alert when webhook booking persistence fails", async () => {
    (verifyWebhookSignature as jest.Mock).mockReturnValue(true);
    (verifyTransaction as jest.Mock).mockResolvedValue({
      status: true,
      data: {
        reference: "ref_123",
        status: "success",
        amount: 1000,
        metadata: {
          apartment_id: "lofty-wuye-01",
          check_in: "2026-01-01",
          check_out: "2026-01-02",
        },
        customer: { email: "guest@example.com" },
      },
    });

    const { upsertBookingFromPaystack } = require("@/lib/booking");
    (upsertBookingFromPaystack as jest.Mock).mockRejectedValueOnce(
      new Error("db down")
    );

    const request = makeNextRequest("http://localhost/api/paystack/webhook", {
      method: "POST",
      headers: {
        "x-paystack-signature": "sig",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        event: "charge.success",
        data: { reference: "ref_123" },
      }),
    });

    const response = await postPaystackWebhook(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual(expect.objectContaining({ error: expect.any(String) }));
    expect(sendAdminAlertBookingPersistenceFailed).toHaveBeenCalledWith(
      expect.objectContaining({
        reference: "ref_123",
      })
    );
  });

  it("enqueues post-booking jobs after a manual admin booking is created (async processing)", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon_key";

    const { prisma } = require("@/lib/db");
    (createClient as jest.Mock).mockReturnValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: "admin_user_1", email: "admin@example.com" } },
          error: null,
        }),
      },
    });
    (prisma.adminUser.findFirst as jest.Mock).mockResolvedValueOnce({
      supabaseUserId: "admin_user_1",
      email: "admin@example.com",
      role: "admin",
    });
    (prisma.booking.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (prisma.booking.create as jest.Mock).mockResolvedValueOnce({
      id: "booking_1",
      reference: "manual_ref_1",
    });

    const request = makeNextRequest("http://localhost/api/admin/bookings", {
      method: "POST",
      headers: {
        authorization: "Bearer admin_token",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: "Manual Guest",
        email: "guest@example.com",
        phone: "08000000000",
        apartmentId: "lofty-wuye-01",
        checkIn: "2026-05-01",
        checkOut: "2026-05-03",
        amountNgn: 150000,
        paymentMethod: "cash",
      }),
    });

    const response = await postAdminBooking(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual(
      expect.objectContaining({ ok: true, bookingId: "booking_1" })
    );
    expect(enqueuePostBookingJobs).toHaveBeenCalledWith("booking_1");
    expect(flushPostBookingJobsForBooking).toHaveBeenCalledWith("booking_1");
    expect(processPostBookingJobs).not.toHaveBeenCalled();
  });
});
