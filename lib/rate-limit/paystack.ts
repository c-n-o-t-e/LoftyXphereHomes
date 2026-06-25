import {
    PAYSTACK_INIT_RATE_LIMIT_MAX,
    PAYSTACK_INIT_RATE_LIMIT_WINDOW_MS,
} from "@/lib/rate-limit/constants";
import { consumeRateLimit } from "@/lib/rate-limit/postgres";

export function buildPaystackInitRateLimitKey(ip: string, email: string): string {
    const normalizedEmail = email.trim().toLowerCase();
    return `paystack-init:${ip}:${normalizedEmail}`;
}

export async function checkPaystackInitRateLimit(ip: string, email: string) {
    const bucketKey = buildPaystackInitRateLimitKey(ip, email);
    return consumeRateLimit(bucketKey, {
        windowMs: PAYSTACK_INIT_RATE_LIMIT_WINDOW_MS,
        max: PAYSTACK_INIT_RATE_LIMIT_MAX,
    });
}
