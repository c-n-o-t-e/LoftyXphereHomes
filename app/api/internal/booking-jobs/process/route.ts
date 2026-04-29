import { NextRequest, NextResponse } from "next/server";
import { processPostBookingJobs } from "@/lib/ops/bookingJobs";

function isAuthorized(request: NextRequest): boolean {
    const secret = process.env.BOOKING_JOBS_SECRET?.trim();
    if (!secret) return false;
    const header =
        request.headers.get("x-booking-jobs-secret") ||
        request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    return Boolean(header && header === secret);
}

export async function POST(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await processPostBookingJobs({ limit: 20 });
    return NextResponse.json({ ok: true, ...result });
}

