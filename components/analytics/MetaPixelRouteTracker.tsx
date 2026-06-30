"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isMetaPixelConfigured } from "@/lib/analytics/config";
import { isAnalyticsExcludedPath } from "@/lib/analytics/paths";
import { trackMetaPageView } from "@/lib/analytics/metaPixel";

/**
 * Sends Meta Pixel PageView on App Router client navigations.
 * Initial load is handled by the inline init script in MetaPixel.
 */
export function MetaPixelRouteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isMetaPixelConfigured() || !pathname || isAnalyticsExcludedPath(pathname)) {
      return;
    }
    trackMetaPageView();
  }, [pathname]);

  return null;
}
