import { NextRequest, NextResponse } from "next/server";
import { processPostBookingJobs } from "@/lib/ops/bookingJobs";

function isAuthorized(request: NextRequest): boolean {
    const allowedSecrets = [
        process.env.BOOKING_JOBS_SECRET?.trim(),
        process.env.CRON_SECRET?.trim(),
    ].filter(Boolean);
    if (allowedSecrets.length === 0) return false;

    const header =
        request.headers.get("x-booking-jobs-secret") ||
        request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    return Boolean(header && allowedSecrets.includes(header));
}

async function processRequest(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const result = await processPostBookingJobs({ limit: 20 });
    return NextResponse.json({ ok: true, ...result });
}

export async function GET(request: NextRequest) {
    return processRequest(request);
}

export async function POST(request: NextRequest) {
    return processRequest(request);
}

