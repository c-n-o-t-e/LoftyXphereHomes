"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { getGaMeasurementId, isGaConfigured } from "@/lib/analytics/config";
import { isAnalyticsExcludedPath } from "@/lib/analytics/paths";
import { GoogleAnalyticsRouteTracker } from "@/components/analytics/GoogleAnalyticsRouteTracker";
import { useOptionalCookieConsent } from "@/components/analytics/CookieConsentContext";
import { readClientInternalTrafficOptedOut } from "@/lib/analytics/internal";

/**
 * Loads GA4 gtag.js on public routes when analytics consent allows it.
 * Admin routes (`/admin/*`) and staff opt-out browsers are excluded.
 */
export function GoogleAnalytics({
  internalTrafficOptedOut = false,
}: {
  internalTrafficOptedOut?: boolean;
}) {
  const pathname = usePathname();
  const measurementId = getGaMeasurementId();
  const cookieConsent = useOptionalCookieConsent();
  const analyticsEnabled = cookieConsent?.analyticsEnabled ?? true;
  const isInternal =
    internalTrafficOptedOut || readClientInternalTrafficOptedOut();

  if (
    !isGaConfigured() ||
    !measurementId ||
    !analyticsEnabled ||
    isInternal ||
    isAnalyticsExcludedPath(pathname ?? "")
  ) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
          });
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
          });
        `}
      </Script>
      <GoogleAnalyticsRouteTracker />
    </>
  );
}
