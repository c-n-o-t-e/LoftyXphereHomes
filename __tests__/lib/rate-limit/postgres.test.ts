jest.mock("@/lib/db", () => ({
  prisma: {
    $queryRaw: jest.fn(),
    rateLimitBucket: {
      deleteMany: jest.fn(),
    },
  },
}));

const { prisma } = require("@/lib/db");
const { consumeRateLimit, cleanupExpiredRateLimitBuckets } =
  require("@/lib/rate-limit/postgres");

describe("consumeRateLimit", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Math, "random").mockReturnValue(1);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns limited=false when count is within max", async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ count: 3 }]);

    const result = await consumeRateLimit("contact:1.2.3.4:user@example.com", {
      windowMs: 10 * 60 * 1000,
      max: 5,
    });

    expect(result).toEqual({ count: 3, limited: false });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it("returns limited=true when count exceeds max", async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ count: 6 }]);

    const result = await consumeRateLimit("contact:1.2.3.4:user@example.com", {
      windowMs: 10 * 60 * 1000,
      max: 5,
    });

    expect(result).toEqual({ count: 6, limited: true });
  });
});

describe("cleanupExpiredRateLimitBuckets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deletes rows past expiry", async () => {
    (prisma.rateLimitBucket.deleteMany as jest.Mock).mockResolvedValueOnce({
      count: 4,
    });

    await expect(cleanupExpiredRateLimitBuckets()).resolves.toBe(4);
    expect(prisma.rateLimitBucket.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lt: expect.any(Date) } },
    });
  });
});
