import {
    buildContentSecurityPolicy,
    buildSecurityHeaders,
} from "@/lib/security/headers";

function headerValue(headers: ReturnType<typeof buildSecurityHeaders>, key: string) {
    return headers.find((header) => header.key === key)?.value;
}

describe("buildContentSecurityPolicy", () => {
    it("includes required third-party hosts in production policy", () => {
        const csp = buildContentSecurityPolicy(false);

        expect(csp).toContain("https://*.supabase.co");
        expect(csp).toContain("https://images.unsplash.com");
        expect(csp).toContain("https://www.google.com");
        expect(csp).toContain("frame-ancestors 'none'");
        expect(csp).toContain("upgrade-insecure-requests");
        expect(csp).not.toContain("'unsafe-eval'");
    });

    it("includes Google Analytics hosts when GA measurement ID is configured", () => {
        const previous = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = "G-TEST123";

        const csp = buildContentSecurityPolicy(false);

        expect(csp).toContain("https://www.googletagmanager.com");
        expect(csp).toContain("https://www.google-analytics.com");
        expect(csp).toContain("https://*.analytics.google.com");

        if (previous === undefined) {
            delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
        } else {
            process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = previous;
        }
    });

    it("includes Meta Pixel hosts when pixel ID is configured", () => {
        const previous = process.env.NEXT_PUBLIC_META_PIXEL_ID;
        process.env.NEXT_PUBLIC_META_PIXEL_ID = "1234567890";

        const csp = buildContentSecurityPolicy(false);

        expect(csp).toContain("https://connect.facebook.net");
        expect(csp).toContain("https://www.facebook.com");

        if (previous === undefined) {
            delete process.env.NEXT_PUBLIC_META_PIXEL_ID;
        } else {
            process.env.NEXT_PUBLIC_META_PIXEL_ID = previous;
        }
    });

    it("allows unsafe-eval in development for Next.js HMR", () => {
        const csp = buildContentSecurityPolicy(true);

        expect(csp).toContain("'unsafe-eval'");
        expect(csp).not.toContain("upgrade-insecure-requests");
    });
});

describe("buildSecurityHeaders", () => {
    it("always includes baseline security headers", () => {
        const headers = buildSecurityHeaders("development");

        expect(headerValue(headers, "X-Frame-Options")).toBe("DENY");
        expect(headerValue(headers, "X-Content-Type-Options")).toBe("nosniff");
        expect(headerValue(headers, "Referrer-Policy")).toBe(
            "strict-origin-when-cross-origin",
        );
        expect(headerValue(headers, "Permissions-Policy")).toBe(
            "camera=(), microphone=(), geolocation=()",
        );
        expect(headerValue(headers, "X-DNS-Prefetch-Control")).toBe("on");
        expect(headerValue(headers, "Content-Security-Policy")).toBeTruthy();
    });

    it("includes HSTS only in production", () => {
        const devHeaders = buildSecurityHeaders("development");
        const prodHeaders = buildSecurityHeaders("production");

        expect(headerValue(devHeaders, "Strict-Transport-Security")).toBeUndefined();
        expect(headerValue(prodHeaders, "Strict-Transport-Security")).toBe(
            "max-age=63072000; includeSubDomains; preload",
        );
    });

    it("includes enforced CSP in production", () => {
        const prodHeaders = buildSecurityHeaders("production");
        const csp = headerValue(prodHeaders, "Content-Security-Policy");

        expect(csp).toContain("default-src 'self'");
        expect(csp).toContain("object-src 'none'");
    });
});
