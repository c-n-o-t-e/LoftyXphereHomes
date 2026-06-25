"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pageview } from "@/lib/analytics/gtag";
import { isGaConfigured } from "@/lib/analytics/config";
import { isAnalyticsExcludedPath } from "@/lib/analytics/paths";

/**
 * Sends GA4 page_view on App Router client navigations.
 * Initial load is handled by the inline gtag config in GoogleAnalytics.
 */
export function GoogleAnalyticsRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isGaConfigured() || !pathname || isAnalyticsExcludedPath(pathname)) {
      return;
    }
    pageview(pathname);
  }, [pathname]);

  return null;
}
