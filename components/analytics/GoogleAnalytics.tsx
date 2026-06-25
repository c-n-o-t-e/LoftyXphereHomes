import Script from "next/script";
import { getGaMeasurementId, isGaConfigured } from "@/lib/analytics/config";
import { GoogleAnalyticsRouteTracker } from "@/components/analytics/GoogleAnalyticsRouteTracker";

/**
 * Loads GA4 gtag.js and tracks route changes in the App Router.
 * Renders nothing when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset.
 */
export function GoogleAnalytics() {
  const measurementId = getGaMeasurementId();
  if (!isGaConfigured()) return null;

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
