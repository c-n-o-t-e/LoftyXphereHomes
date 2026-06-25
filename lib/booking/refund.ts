import { prisma } from "@/lib/db";
import type { PaystackRefundResult } from "@/lib/paystack";

/** Re-claim stale PENDING rows after a crashed refund attempt. */
export const STALE_REFUND_PENDING_MS = 5 * 60 * 1000;

export type RefundClaimResult =
    | { action: "claimed" }
    | { action: "already_refunded" }
    | { action: "blocked" };

export function extractPaystackRefundReference(data: unknown): string | null {
    if (!data || typeof data !== "object") return null;
    const record = data as { id?: unknown; transaction?: { id?: unknown } };
    if (record.id != null) return String(record.id);
    if (record.transaction?.id != null) return String(record.transaction.id);
    return null;
}

/**
 * Atomically claim refund processing for a booking reference.
 * Prevents duplicate Paystack refund API calls on webhook replay.
 */
export async function tryClaimRefundProcessing(
    reference: string,
): Promise<RefundClaimResult> {
    const now = new Date();
    const staleBefore = new Date(now.getTime() - STALE_REFUND_PENDING_MS);

    let claim = await prisma.booking.updateMany({
        where: {
            reference,
            refundStatus: { in: ["NONE", "FAILED"] },
        },
        data: { refundStatus: "PENDING" },
    });
    if (claim.count > 0) return { action: "claimed" };

    claim = await prisma.booking.updateMany({
        where: {
            reference,
            refundStatus: "PENDING",
            updatedAt: { lt: staleBefore },
        },
        data: { refundStatus: "PENDING", updatedAt: now },
    });
    if (claim.count > 0) return { action: "claimed" };

    const row = await prisma.booking.findUnique({
        where: { reference },
        select: { refundStatus: true },
    });
    if (row?.refundStatus === "REFUNDED") {
        return { action: "already_refunded" };
    }
    return { action: "blocked" };
}

export async function finalizeRefundResult(args: {
    reference: string;
    refund: PaystackRefundResult;
}): Promise<void> {
    const paystackRefundReference = args.refund.ok
        ? extractPaystackRefundReference(args.refund.data)
        : null;

    await prisma.booking.update({
        where: { reference: args.reference },
        data: {
            refundStatus: args.refund.ok ? "REFUNDED" : "FAILED",
            paystackRefundReference,
            refundedAt: args.refund.ok ? new Date() : null,
        },
    });
}
