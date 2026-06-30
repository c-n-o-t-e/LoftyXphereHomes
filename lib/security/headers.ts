export type SecurityHeader = {
    key: string;
    value: string;
};

export function buildContentSecurityPolicy(isDev: boolean): string {
    const gaEnabled = Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim());
    const metaEnabled = Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim());

    const scriptSrcParts = ["'self'", "'unsafe-inline'"];
    if (isDev) {
        scriptSrcParts.push("'unsafe-eval'");
    }
    if (gaEnabled) {
        scriptSrcParts.push("https://www.googletagmanager.com");
    }
    if (metaEnabled) {
        scriptSrcParts.push("https://connect.facebook.net");
    }

    const connectSrcParts = [
        "'self'",
        "https://*.supabase.co",
        "wss://*.supabase.co",
    ];
    if (gaEnabled) {
        connectSrcParts.push(
            "https://www.google-analytics.com",
            "https://*.google-analytics.com",
            "https://*.analytics.google.com",
            "https://www.googletagmanager.com",
            "https://stats.g.doubleclick.net",
        );
    }
    if (metaEnabled) {
        connectSrcParts.push(
            "https://www.facebook.com",
            "https://connect.facebook.net",
        );
    }

    const imgSrcParts = [
        "'self'",
        "data:",
        "blob:",
        "https://images.unsplash.com",
        "https://*.supabase.co",
    ];
    if (gaEnabled) {
        imgSrcParts.push(
            "https://www.google-analytics.com",
            "https://www.googletagmanager.com",
        );
    }
    if (metaEnabled) {
        imgSrcParts.push("https://www.facebook.com");
    }

    const directives = [
        "default-src 'self'",
        `script-src ${scriptSrcParts.join(" ")}`,
        "style-src 'self' 'unsafe-inline'",
        `img-src ${imgSrcParts.join(" ")}`,
        "font-src 'self' data:",
        `connect-src ${connectSrcParts.join(" ")}`,
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
