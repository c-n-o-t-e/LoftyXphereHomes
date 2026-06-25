/** Default contact form window: 5 submissions per IP+email per 10 minutes. */
export const CONTACT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const CONTACT_RATE_LIMIT_MAX = 5;

/** Paystack checkout init: 10 attempts per IP+email per 10 minutes. */
export const PAYSTACK_INIT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
export const PAYSTACK_INIT_RATE_LIMIT_MAX = 10;

/** Probabilistic cleanup of expired buckets on consume (keeps table small). */
export const RATE_LIMIT_CLEANUP_PROBABILITY = 0.01;
