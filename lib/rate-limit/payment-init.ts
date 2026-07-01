import {
    PAYSTACK_INIT_RATE_LIMIT_MAX,
    PAYSTACK_INIT_RATE_LIMIT_WINDOW_MS,
} from "@/lib/rate-limit/constants";
import { consumeRateLimit } from "@/lib/rate-limit/postgres";

export function buildPaymentInitRateLimitKey(ip: string, email: string): string {
    const normalizedEmail = email.trim().toLowerCase();
    return `payment-init:${ip}:${normalizedEmail}`;
}

export async function checkPaymentInitRateLimit(ip: string, email: string) {
    const bucketKey = buildPaymentInitRateLimitKey(ip, email);
    return consumeRateLimit(bucketKey, {
        windowMs: PAYSTACK_INIT_RATE_LIMIT_WINDOW_MS,
        max: PAYSTACK_INIT_RATE_LIMIT_MAX,
    });
}

/** @deprecated Use checkPaymentInitRateLimit */
export const buildPaystackInitRateLimitKey = buildPaymentInitRateLimitKey;

/** @deprecated Use checkPaymentInitRateLimit */
export const checkPaystackInitRateLimit = checkPaymentInitRateLimit;
