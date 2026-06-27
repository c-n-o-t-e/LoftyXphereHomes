/** Cookie set when staff opts out of GA via the secret link (1 year). */
export const INTERNAL_TRAFFIC_COOKIE = "lxh-analytics-internal";

export const INTERNAL_OPTOUT_QUERY_PARAM = "lxh_internal";

/** Server-only secret — never use NEXT_PUBLIC for this. */
export function getInternalOptOutSecret(): string {
  return process.env.ANALYTICS_INTERNAL_OPTOUT_SECRET?.trim() ?? "";
}

export function isInternalTrafficOptedOut(
  cookieValue?: string | null,
): boolean {
  return cookieValue === "1";
}

export function readClientInternalTrafficOptedOut(): boolean {
  if (typeof window === "undefined") return false;

  return (
    document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${INTERNAL_TRAFFIC_COOKIE}=`))
      ?.split("=")[1] === "1"
  );
}
