import { prisma } from "@/lib/db";
import { RATE_LIMIT_CLEANUP_PROBABILITY } from "@/lib/rate-limit/constants";

export type RateLimitResult = {
    limited: boolean;
    count: number;
};

type ConsumeRateLimitOptions = {
    windowMs: number;
    max: number;
};

/**
 * Atomically increment a shared Postgres counter and report whether the limit is exceeded.
 * Safe across serverless instances (single-row upsert per bucket key).
 */
export async function consumeRateLimit(
    bucketKey: string,
    options: ConsumeRateLimitOptions,
): Promise<RateLimitResult> {
    const windowSeconds = Math.max(1, Math.floor(options.windowMs / 1000));

    const rows = await prisma.$queryRaw<Array<{ count: number }>>`
        INSERT INTO rate_limit_buckets (bucket_key, count, window_start, expires_at)
        VALUES (
            ${bucketKey},
            1,
            NOW(),
            NOW() + (${windowSeconds} * INTERVAL '1 second')
        )
        ON CONFLICT (bucket_key) DO UPDATE SET
            count = CASE
                WHEN rate_limit_buckets.expires_at < NOW() THEN 1
                ELSE rate_limit_buckets.count + 1
            END,
            window_start = CASE
                WHEN rate_limit_buckets.expires_at < NOW() THEN NOW()
                ELSE rate_limit_buckets.window_start
            END,
            expires_at = CASE
                WHEN rate_limit_buckets.expires_at < NOW() THEN NOW() + (${windowSeconds} * INTERVAL '1 second')
                ELSE rate_limit_buckets.expires_at
            END
        RETURNING count
    `;

    const count = Number(rows[0]?.count ?? 1);
    maybeCleanupExpiredBuckets();

    return {
        count,
        limited: count > options.max,
    };
}

function maybeCleanupExpiredBuckets(): void {
    if (Math.random() >= RATE_LIMIT_CLEANUP_PROBABILITY) return;

    void cleanupExpiredRateLimitBuckets().catch((err) => {
        console.error("rate-limit: expired bucket cleanup failed", err);
    });
}

export async function cleanupExpiredRateLimitBuckets(): Promise<number> {
    const result = await prisma.rateLimitBucket.deleteMany({
        where: { expiresAt: { lt: new Date() } },
    });
    return result.count;
}
