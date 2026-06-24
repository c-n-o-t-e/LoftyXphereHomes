export type SecurityHeader = {
    key: string;
    value: string;
};

export function buildContentSecurityPolicy(isDev: boolean): string {
    const scriptSrc = isDev
        ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
        : "script-src 'self' 'unsafe-inline'";

    const directives = [
        "default-src 'self'",
        scriptSrc,
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
        "frame-src 'self' https://www.google.com",
        "media-src 'self' https://*.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
    ];

    if (!isDev) {
        directives.push("upgrade-insecure-requests");
    }

    return directives.join("; ");
}

export function buildSecurityHeaders(
    nodeEnv: string = process.env.NODE_ENV ?? "development",
): SecurityHeader[] {
    const isDev = nodeEnv !== "production";

    const headers: SecurityHeader[] = [
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
        },
        { key: "X-DNS-Prefetch-Control", value: "on" },
        {
            key: "Content-Security-Policy",
            value: buildContentSecurityPolicy(isDev),
        },
    ];

    if (!isDev) {
        headers.push({
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
        });
    }

    return headers;
}
