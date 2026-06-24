import { createHash } from "crypto";
import { prisma } from "@/lib/db";
import type { PrismaClient } from "@/lib/generated/prisma/client";

/** Checkout hold duration while guest completes Paystack payment. */
export const BOOKING_HOLD_TTL_MS = 5 * 60 * 1000;

export class BookingDateConflictError extends Error {
    readonly code = "DATE_CONFLICT" as const;
    readonly refundInitiated: boolean;

    constructor(
        message = "Requested dates conflict with an existing booking",
        options?: { refundInitiated?: boolean },
    ) {
        super(message);
        this.name = "BookingDateConflictError";
        this.refundInitiated = options?.refundInitiated ?? false;
    }
}

export type BookingTransactionClient = Omit<
    PrismaClient,
    "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends" | "$use"
>;

function advisoryLockKeys(apartmentId: string): [number, number] {
    const hash = createHash("md5").update(apartmentId).digest();
    return [hash.readInt32BE(0), hash.readInt32BE(4)];
}

export async function acquireApartmentBookingLock(
    tx: BookingTransactionClient,
    apartmentId: string,
): Promise<void> {
    const [key1, key2] = advisoryLockKeys(apartmentId);
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${key1}, ${key2})`;
}

export async function cancelExpiredPendingHolds(
    tx: BookingTransactionClient,
): Promise<number> {
    const result = await tx.booking.updateMany({
        where: {
            status: "PENDING",
            expiresAt: { lt: new Date() },
        },
        data: { status: "CANCELLED" },
    });
    return result.count;
}

export function activeBookingStatusOrWhere(now: Date = new Date()) {
    return [
        { status: "PAID" as const },
        {
            status: "PENDING" as const,
            expiresAt: { gt: now },
        },
    ];
}

export function activeBookingOverlapWhere(args: {
    apartmentId: string;
    checkIn: Date;
    checkOut: Date;
    excludeReference?: string;
}) {
    const now = new Date();
    return {
        apartmentId: args.apartmentId,
        checkIn: { lt: args.checkOut },
        checkOut: { gt: args.checkIn },
        ...(args.excludeReference
            ? { reference: { not: args.excludeReference } }
            : {}),
        OR: activeBookingStatusOrWhere(now),
    };
}

export async function findOverlappingBooking(
    tx: BookingTransactionClient,
    args: {
        apartmentId: string;
        checkIn: Date;
        checkOut: Date;
        excludeReference?: string;
    },
) {
    return tx.booking.findFirst({
        where: activeBookingOverlapWhere(args),
        select: {
            id: true,
            reference: true,
            checkIn: true,
            checkOut: true,
            status: true,
        },
    });
}

export async function withApartmentBookingTransaction<T>(
    apartmentId: string,
    fn: (tx: BookingTransactionClient) => Promise<T>,
): Promise<T> {
    return prisma.$transaction(async (tx) => {
        await acquireApartmentBookingLock(tx, apartmentId);
        await cancelExpiredPendingHolds(tx);
        return fn(tx);
    });
}

export function bookingHoldExpiresAt(from: Date = new Date()): Date {
    return new Date(from.getTime() + BOOKING_HOLD_TTL_MS);
}

export function isExclusionConstraintViolation(err: unknown): boolean {
    if (!err || typeof err !== "object") return false;

    const record = err as {
        code?: string;
        meta?: {
            code?: string;
            driverAdapterError?: { cause?: { originalCode?: string } };
        };
        message?: string;
    };

    if (record.code === "P2010" && record.meta?.code === "23P01") return true;
    if (record.code === "23P01") return true;
    if (record.meta?.driverAdapterError?.cause?.originalCode === "23P01") {
        return true;
    }

    const message =
        record.message ?? (err instanceof Error ? err.message : String(err));
    return (
        message.includes("booking_no_overlap") || message.includes("23P01")
    );
}
