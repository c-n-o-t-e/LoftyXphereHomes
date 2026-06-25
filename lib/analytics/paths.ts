/** Path prefixes where GA4 must not load or send hits (e.g. admin backend). */
export const ANALYTICS_EXCLUDED_PATH_PREFIXES = ["/admin"] as const;

export function isAnalyticsExcludedPath(pathname: string): boolean {
  if (!pathname) return false;

  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return ANALYTICS_EXCLUDED_PATH_PREFIXES.some(
    (prefix) =>
      normalized === prefix || normalized.startsWith(`${prefix}/`),
  );
}

export function isAnalyticsAllowedPath(pathname: string): boolean {
  return !isAnalyticsExcludedPath(pathname);
}
