import type { Prisma } from "@/lib/generated/prisma/client";

/**
 * Bookings visible to the signed-in user: linked by userId and/or checkout email.
 */
export function myBookingsWhereForUser(user: {
    id: string;
    email: string;
}): Prisma.BookingWhereInput {
    return {
        status: { in: ["PAID", "PENDING"] },
        OR: [
            { userId: user.id },
            {
                userId: null,
                bookerEmail: user.email,
            },
        ],
    };
}
