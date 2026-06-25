import type { NextRequest } from "next/server";

/** Best-effort client IP from reverse-proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(request: NextRequest): string {
    const xff = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const realIp = request.headers.get("x-real-ip")?.trim();
    return xff || realIp || "unknown";
}
