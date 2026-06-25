import {
  PAYSTACK_INIT_RATE_LIMIT_MAX,
  PAYSTACK_INIT_RATE_LIMIT_WINDOW_MS,
} from "@/lib/rate-limit/constants";
import { buildPaystackInitRateLimitKey } from "@/lib/rate-limit/paystack";

jest.mock("@/lib/rate-limit/postgres", () => ({
  consumeRateLimit: jest.fn(),
}));

const { consumeRateLimit } = require("@/lib/rate-limit/postgres");
const { checkPaystackInitRateLimit } = require("@/lib/rate-limit/paystack");

describe("buildPaystackInitRateLimitKey", () => {
  it("normalizes email casing", () => {
    expect(buildPaystackInitRateLimitKey("1.2.3.4", " User@Example.COM ")).toBe(
      "paystack-init:1.2.3.4:user@example.com",
    );
  });
});

describe("checkPaystackInitRateLimit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("delegates to consumeRateLimit with paystack defaults", async () => {
    (consumeRateLimit as jest.Mock).mockResolvedValueOnce({
      limited: false,
      count: 1,
    });

    await checkPaystackInitRateLimit("9.9.9.9", "guest@test.com");

    expect(consumeRateLimit).toHaveBeenCalledWith(
      "paystack-init:9.9.9.9:guest@test.com",
      {
        windowMs: PAYSTACK_INIT_RATE_LIMIT_WINDOW_MS,
        max: PAYSTACK_INIT_RATE_LIMIT_MAX,
      },
    );
  });
});
