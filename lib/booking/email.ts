const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidBookerEmail(email: string): boolean {
    return EMAIL_REGEX.test(email.trim());
}

/**
 * Some providers prefix customer email in sandbox (e.g. ravesb_<hash>_user@gmail.com).
 * Recover the trailing local-part when it looks like a real address.
 */
export function sanitizePaymentCustomerEmail(raw: string): string {
    const trimmed = raw.trim().toLowerCase();
    if (!trimmed) return trimmed;

    const at = trimmed.lastIndexOf("@");
    if (at <= 0) return trimmed;

    const local = trimmed.slice(0, at);
    const domain = trimmed.slice(at + 1);
    const lastUnderscore = local.lastIndexOf("_");

    if (lastUnderscore > 0 && local.includes("_")) {
        const candidateLocal = local.slice(lastUnderscore + 1);
        const recovered = `${candidateLocal}@${domain}`;
        if (isValidBookerEmail(recovered)) {
            return recovered;
        }
    }

    return trimmed;
}

/** Prefer checkout hold email; fall back to sanitized payment provider email. */
export function resolveBookerEmail(args: {
    holdEmail?: string | null;
    paymentEmail?: string | null;
}): string {
    const hold = args.holdEmail?.trim();
    if (hold) {
        const sanitizedHold = sanitizePaymentCustomerEmail(hold);
        if (isValidBookerEmail(sanitizedHold)) {
            return sanitizedHold;
        }
    }

    const paymentRaw = args.paymentEmail?.trim();
    if (paymentRaw) {
        const payment = sanitizePaymentCustomerEmail(paymentRaw);
        if (isValidBookerEmail(payment)) {
            return payment;
        }
    }

    throw new Error("Missing or invalid booker email");
}
