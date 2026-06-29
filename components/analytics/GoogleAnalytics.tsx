"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import {
  getGaMeasurementId,
  getGoogleAdsConversionId,
  isGaConfigured,
  isGoogleAdsConfigured,
} from "@/lib/analytics/config";
import { buildGtagConsentState } from "@/lib/analytics/gtagConsent";
import { isAnalyticsExcludedPath } from "@/lib/analytics/paths";
import { GoogleAnalyticsRouteTracker } from "@/components/analytics/GoogleAnalyticsRouteTracker";
import { useOptionalCookieConsent } from "@/components/analytics/CookieConsentContext";
import { readClientInternalTrafficOptedOut } from "@/lib/analytics/internal";

/**
 * Loads GA4 gtag.js on public routes when analytics consent allows it.
 * When marketing consent is allowed, also configures the Google Ads tag (`AW-…`).
 * Admin routes (`/admin/*`) and staff opt-out browsers are excluded.
 */
export function GoogleAnalytics({
  internalTrafficOptedOut = false,
}: {
  internalTrafficOptedOut?: boolean;
}) {
  const pathname = usePathname();
  const measurementId = getGaMeasurementId();
  const googleAdsId = getGoogleAdsConversionId();
  const cookieConsent = useOptionalCookieConsent();
  const analyticsEnabled = cookieConsent?.analyticsEnabled ?? true;
  const marketingEnabled = cookieConsent?.marketingEnabled ?? true;
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

  const consent = buildGtagConsentState(analyticsEnabled, marketingEnabled);
  const loadGoogleAdsTag =
    marketingEnabled && isGoogleAdsConfigured() && googleAdsId.length > 0;

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
            analytics_storage: '${consent.analytics_storage}',
            ad_storage: '${consent.ad_storage}',
            ad_user_data: '${consent.ad_user_data}',
            ad_personalization: '${consent.ad_personalization}',
          });
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
            anonymize_ip: true,
          });
          ${
            loadGoogleAdsTag
              ? `gtag('config', '${googleAdsId}');`
              : ""
          }
        `}
      </Script>
      <GoogleAnalyticsRouteTracker />
    </>
  );
}
