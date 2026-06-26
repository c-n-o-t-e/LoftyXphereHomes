"use client";

import Link from "next/link";
import { useCookieConsent } from "@/components/analytics/CookieConsentContext";
import { Button } from "@/components/ui/button";

export function CookieConsentBanner() {
  const { showBanner, acceptAnalytics, rejectAnalytics } = useCookieConsent();

  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
      className="fixed inset-x-0 bottom-0 z-[70] border-t border-black/10 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-sm sm:p-6"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="container mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 pr-2">
          <h2
            id="cookie-consent-title"
            className="text-base font-semibold text-black sm:text-lg"
          >
            Cookies & analytics
          </h2>
          <p
            id="cookie-consent-description"
            className="text-sm leading-relaxed text-black/70"
          >
            We use cookies to understand how visitors use our site and improve
            your experience. Analytics cookies are only used if you accept. See
            our{" "}
            <Link
              href="/privacy"
              className="font-medium text-[#FA5C5C] underline-offset-2 hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={rejectAnalytics}
          >
            Reject analytics
          </Button>
          <Button
            type="button"
            className="rounded-full"
            onClick={acceptAnalytics}
          >
            Accept analytics
          </Button>
        </div>
      </div>
    </div>
  );
}
