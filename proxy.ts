import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  CONSENT_REQUIRED_COOKIE,
  getCookieConsentMode,
} from "@/lib/analytics/consent";
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

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const consentRequired = resolveConsentRequired(request);

  response.cookies.set(CONSENT_REQUIRED_COOKIE, consentRequired ? "1" : "0", {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
