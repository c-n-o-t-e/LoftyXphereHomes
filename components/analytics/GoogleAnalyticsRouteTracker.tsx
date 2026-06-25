"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pageview } from "@/lib/analytics/gtag";
import { isGaConfigured } from "@/lib/analytics/config";

/**
 * Sends GA4 page_view on App Router client navigations.
 * Initial load is handled by the inline gtag config in GoogleAnalytics.
 */
export function GoogleAnalyticsRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isGaConfigured() || !pathname) return;
    pageview(pathname);
  }, [pathname]);

  return null;
}
