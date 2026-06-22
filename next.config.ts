import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        proxyClientMaxBodySize: "12mb",
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
};

export default nextConfig;
