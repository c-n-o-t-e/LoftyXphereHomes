import { timingSafeEqual } from "crypto";

/**
 * Constant-time comparison for hex-encoded secrets (e.g. HMAC digests).
 * Returns false when lengths differ to avoid leaking length via timing.
 */
export function timingSafeEqualHex(a: string, b: string): boolean {
    const left = a.trim();
    const right = b.trim();
    if (left.length !== right.length) return false;
    try {
        return timingSafeEqual(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
    } catch {
        return false;
    }
}

/**
 * Constant-time check whether `candidate` matches any allowed secret.
 */
export function timingSafeEqualAny(
    candidate: string | null | undefined,
    allowed: string[],
): boolean {
    const value = candidate?.trim();
    if (!value || allowed.length === 0) return false;
    let match = false;
    for (const secret of allowed) {
        if (!secret) continue;
        if (timingSafeEqualHex(value, secret)) {
            match = true;
        }
    }
    return match;
}
