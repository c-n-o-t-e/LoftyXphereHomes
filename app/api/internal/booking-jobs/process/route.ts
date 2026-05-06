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

function wantsImmediateRun(request: NextRequest): boolean {
    if (request.nextUrl.searchParams.get("immediate") === "1") return true;
    const h = request.headers.get("x-booking-jobs-immediate");
    return h === "1" || h?.toLowerCase() === "true";
}

async function processRequest(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Vercel Cron: omit `immediate` → respect backoff on FAILED rows (nextRunAt).
    // Manual re-drive: `?immediate=1` or header `X-Booking-Jobs-Immediate: 1`.
    const immediate = wantsImmediateRun(request);
    const bookingId =
        request.nextUrl.searchParams.get("bookingId")?.trim() || undefined;
    const result = await processPostBookingJobs({
        limit: bookingId ? 2 : 20,
        bookingId,
        respectBackoff: !immediate,
    });
    return NextResponse.json({
        ok: true,
        respectBackoff: !immediate,
        immediate,
        bookingId: bookingId ?? null,
        ...result,
    });
}

export async function GET(request: NextRequest) {
    return processRequest(request);
}

export async function POST(request: NextRequest) {
    return processRequest(request);
}

