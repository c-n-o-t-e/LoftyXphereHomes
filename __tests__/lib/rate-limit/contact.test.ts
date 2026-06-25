import { buildContactRateLimitKey } from "@/lib/rate-limit/contact";
import {
  CONTACT_RATE_LIMIT_MAX,
  CONTACT_RATE_LIMIT_WINDOW_MS,
} from "@/lib/rate-limit/constants";

jest.mock("@/lib/rate-limit/postgres", () => ({
  consumeRateLimit: jest.fn(),
}));

const { consumeRateLimit } = require("@/lib/rate-limit/postgres");
const { checkContactRateLimit } = require("@/lib/rate-limit/contact");

describe("buildContactRateLimitKey", () => {
  it("normalizes email and scopes by route prefix", () => {
    expect(buildContactRateLimitKey("1.2.3.4", " User@Example.COM ")).toBe(
      "contact:1.2.3.4:user@example.com",
    );
  });
});

describe("checkContactRateLimit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates to consumeRateLimit with contact defaults", async () => {
    (consumeRateLimit as jest.Mock).mockResolvedValueOnce({
      count: 2,
      limited: false,
    });

    const result = await checkContactRateLimit("9.9.9.9", "guest@test.com");

    expect(consumeRateLimit).toHaveBeenCalledWith(
      "contact:9.9.9.9:guest@test.com",
      {
        windowMs: CONTACT_RATE_LIMIT_WINDOW_MS,
        max: CONTACT_RATE_LIMIT_MAX,
      },
    );
    expect(result).toEqual({ count: 2, limited: false });
  });
});
