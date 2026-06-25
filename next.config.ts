import type { NextConfig } from "next";
import { buildSecurityHeaders } from "./lib/security/headers";

const nextConfig: NextConfig = {
    serverExternalPackages: ["sharp", "@supabase/supabase-js", "ffmpeg-static"],
    experimental: {
        proxyClientMaxBodySize: "300mb",
        serverActions: {
            bodySizeLimit: "12mb",
        },
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            // Supabase Storage public URLs — static pattern so builds don't depend on .env
            {
                protocol: "https",
                hostname: "*.supabase.co",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: buildSecurityHeaders(),
            },
        ];
    },
};

export default nextConfig;
