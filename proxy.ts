import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  CONSENT_REQUIRED_COOKIE,
  getCookieConsentMode,
} from "@/lib/analytics/consent";
import {
  getInternalOptOutSecret,
  INTERNAL_OPTOUT_QUERY_PARAM,
  INTERNAL_TRAFFIC_COOKIE,
} from "@/lib/analytics/internal";
import { isEeaOrUkCountry } from "@/lib/analytics/regions";

function resolveConsentRequired(request: NextRequest): boolean {
  const mode = getCookieConsentMode();

  if (mode === "off") return false;
  if (mode === "always") return true;

  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry");

  return isEeaOrUkCountry(country);
}

function applyConsentRequiredCookie(
  response: NextResponse,
  request: NextRequest,
): void {
  const consentRequired = resolveConsentRequired(request);
  response.cookies.set(CONSENT_REQUIRED_COOKIE, consentRequired ? "1" : "0", {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });
}

/**
 * Staff opt-out: visit `/?lxh_internal=SECRET` once per browser to skip GA for 1 year.
 * Re-enable: `/?lxh_internal=SECRET&analytics=on`
 */
function handleInternalTrafficOptOut(
  request: NextRequest,
): NextResponse | null {
  const secret = getInternalOptOutSecret();
  if (!secret) return null;

  const token = request.nextUrl.searchParams.get(INTERNAL_OPTOUT_QUERY_PARAM);
  if (!token || token !== secret) return null;

  const cleanUrl = request.nextUrl.clone();
  cleanUrl.searchParams.delete(INTERNAL_OPTOUT_QUERY_PARAM);
  const reEnable = cleanUrl.searchParams.get("analytics") === "on";
  cleanUrl.searchParams.delete("analytics");

  const response = NextResponse.redirect(cleanUrl);
  applyConsentRequiredCookie(response, request);

  if (reEnable) {
    response.cookies.set(INTERNAL_TRAFFIC_COOKIE, "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });
  } else {
    response.cookies.set(INTERNAL_TRAFFIC_COOKIE, "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}

export function proxy(request: NextRequest) {
  const optOutResponse = handleInternalTrafficOptOut(request);
  if (optOutResponse) return optOutResponse;

  const response = NextResponse.next();
  applyConsentRequiredCookie(response, request);
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
