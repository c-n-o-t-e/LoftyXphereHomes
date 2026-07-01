import type { PaymentProviderId } from "@/lib/payments/types";

export function buildBookingSuccessCallbackUrl(
    baseUrl: string,
    reference: string,
    provider: PaymentProviderId,
): string {
    const params = new URLSearchParams({
        reference,
        provider,
    });
    const origin = baseUrl.replace(/\/$/, "");
    return `${origin}/booking/success?${params.toString()}`;
}
