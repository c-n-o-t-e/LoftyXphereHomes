import type { NextConfig } from "next";

function getSupabaseHostname(): string | null {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return null;
    try {
        return new URL(supabaseUrl).hostname;
    } catch {
        return null;
    }
}

const supabaseHostname = getSupabaseHostname();

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
            },
            ...(supabaseHostname
                ? [
                      {
                          protocol: "https" as const,
                          hostname: supabaseHostname,
                          pathname: "/storage/v1/object/public/**",
                      },
                  ]
                : []),
        ],
    },
};

export default nextConfig;
