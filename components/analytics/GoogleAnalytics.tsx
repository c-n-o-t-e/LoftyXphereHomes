"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { getGaMeasurementId, isGaConfigured } from "@/lib/analytics/config";
import { isAnalyticsExcludedPath } from "@/lib/analytics/paths";
import { GoogleAnalyticsRouteTracker } from "@/components/analytics/GoogleAnalyticsRouteTracker";

/**
 * Loads GA4 gtag.js on public routes only and tracks App Router navigations.
 * Admin routes (`/admin/*`) are excluded — no scripts, page views, or events.
 */
export function GoogleAnalytics() {
  const pathname = usePathname();
  const measurementId = getGaMeasurementId();

  if (
    !isGaConfigured() ||
    !measurementId ||
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
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
      <GoogleAnalyticsRouteTracker />
    </>
  );
}
