"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { getMetaPixelId, isMetaPixelConfigured } from "@/lib/analytics/config";
import { isAnalyticsExcludedPath } from "@/lib/analytics/paths";
import { MetaPixelRouteTracker } from "@/components/analytics/MetaPixelRouteTracker";
import { useOptionalCookieConsent } from "@/components/analytics/CookieConsentContext";
import { readClientInternalTrafficOptedOut } from "@/lib/analytics/internal";

/**
 * Loads Meta Pixel on public routes when marketing consent allows it.
 * Admin routes (`/admin/*`) and staff opt-out browsers are excluded.
 */
export function MetaPixel({
  internalTrafficOptedOut = false,
}: {
  internalTrafficOptedOut?: boolean;
}) {
  const pathname = usePathname();
  const pixelId = getMetaPixelId();
  const cookieConsent = useOptionalCookieConsent();
  const marketingEnabled = cookieConsent?.marketingEnabled ?? true;
  const isInternal =
    internalTrafficOptedOut || readClientInternalTrafficOptedOut();

  if (
    !isMetaPixelConfigured() ||
    !pixelId ||
    !marketingEnabled ||
    isInternal ||
    isAnalyticsExcludedPath(pathname ?? "")
  ) {
    return null;
  }

  return (
    <>
      <Script id="meta-pixel-init" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
      <MetaPixelRouteTracker />
    </>
  );
}
