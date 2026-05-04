/**
 * Normalize an untrusted redirect target into a safe internal path.
 *
 * Security goals:
 * - Allow only same-site relative paths (e.g. "/my-bookings", "/apartments?id=1").
 * - Block open-redirect vectors like "https://evil.com", "//evil.com", "javascript:...".
 * - Avoid backslash/path confusion.
 *
 * Notes:
 * - This is intended for client-side use (e.g. login redirects).
 * - It does not validate that the path exists; it only ensures it stays internal.
 */
export function normalizeInternalRedirect(
  input: string | null | undefined,
  fallback: string
): string {
  const fb = fallback.startsWith("/") ? fallback : `/${fallback}`;
  const raw = (input ?? "").trim();
  if (!raw) return fb;

  // Disallow protocol-relative, absolute URLs, and weird schemes.
  // Also disallow backslashes to avoid "\" being interpreted differently across layers.
  if (raw.startsWith("//")) return fb;
  if (raw.includes("\\")) return fb;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) return fb;

  // Must be an absolute path within the site.
  if (!raw.startsWith("/")) return fb;

  // Prevent "path//host" style confusion and keep it simple.
  const safe = raw.replace(/\/{2,}/g, "/");

  // Ensure it parses as a URL path (base required).
  try {
    const u = new URL(safe, "https://example.invalid");
    return u.pathname + u.search + u.hash;
  } catch {
    return fb;
  }
}

/**
 * Builds the redirect URL Supabase should send users to after email magic links.
 * Using one fixed path (/auth/callback) keeps dashboard URLs working even when only
 * `https://your-domain/auth/callback` is added to Supabase "Redirect URLs".
 * The post-login destination is passed as `next` (validated again on the callback page).
 */
export function buildAuthEmailRedirectUrl(
  siteBaseUrl: string,
  nextPath?: string | null,
): string {
  const trimmed = siteBaseUrl.trim().replace(/\/$/, "");
  const base = trimmed || "http://localhost:3000";
  const next = normalizeInternalRedirect(nextPath, "/my-bookings");
  const url = new URL(`${base}/auth/callback`);
  url.searchParams.set("next", next);
  return url.toString();
}

