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
  after: (fn: () => Promise<void>) => {
    void fn();
  },
}));

jest.mock("@/lib/email/contact-notifications", () => ({
  sendContactFormEmails: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/db", () => ({
  prisma: {
    contactMessage: {
      create: jest.fn(),
    },
  },
}));

const { POST } = require("@/app/api/contact/route");
const { prisma } = require("@/lib/db");
const {
  sendContactFormEmails,
} = require("@/lib/email/contact-notifications");

function makeReq(body: unknown, headers?: Record<string, string>): NextRequest {
  const hdrs = new Map(Object.entries(headers ?? {}).map(([k, v]) => [k.toLowerCase(), v]));
  return {
    headers: {
      get: (name: string) => hdrs.get(name.toLowerCase()) ?? null,
      entries: function* () {
        for (const entry of hdrs.entries()) yield entry;
      },
    },
    async json() {
      return body;
    },
  } as unknown as NextRequest;
}

describe("POST /api/contact", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists a valid message", async () => {
    (prisma.contactMessage.create as jest.Mock).mockResolvedValueOnce({ id: "1" });
    const res = await POST(
      makeReq(
        {
          name: "Jane Doe",
          email: "jane@example.com",
          phone: "+2348161122328",
          category: "booking",
          message: "Hello, I need help with a booking.",
          website: "",
        },
        { "x-forwarded-for": "1.2.3.4", "user-agent": "jest" }
      )
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(prisma.contactMessage.create).toHaveBeenCalled();
    await Promise.resolve();
    await Promise.resolve();
    expect(sendContactFormEmails).toHaveBeenCalledWith({
      name: "Jane Doe",
      email: "jane@example.com",
      phone: "+2348161122328",
      category: "booking",
      message: "Hello, I need help with a booking.",
    });
  });

  it("treats honeypot submissions as success without persisting", async () => {
    const res = await POST(
      makeReq({
        name: "Spam Bot",
        email: "spam@example.com",
        phone: "+2348161122328",
        category: "booking",
        message: "Buy now",
        website: "http://spam.test",
      })
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(prisma.contactMessage.create).not.toHaveBeenCalled();
    expect(sendContactFormEmails).not.toHaveBeenCalled();
  });
});

