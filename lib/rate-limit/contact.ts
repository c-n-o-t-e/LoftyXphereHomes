import {
    CONTACT_RATE_LIMIT_MAX,
    CONTACT_RATE_LIMIT_WINDOW_MS,
} from "@/lib/rate-limit/constants";
import { consumeRateLimit } from "@/lib/rate-limit/postgres";

export function buildContactRateLimitKey(ip: string, email: string): string {
    const normalizedEmail = email.trim().toLowerCase();
    return `contact:${ip}:${normalizedEmail}`;
}

export async function checkContactRateLimit(
    ip: string,
    email: string,
): Promise<{ limited: boolean; count: number }> {
    const bucketKey = buildContactRateLimitKey(ip, email);
    return consumeRateLimit(bucketKey, {
        windowMs: CONTACT_RATE_LIMIT_WINDOW_MS,
        max: CONTACT_RATE_LIMIT_MAX,
    });
}
