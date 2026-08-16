import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

type RouteError = {
    httpResponse?: Response;
    statusCode?: number;
};

const ALLOWED_HOST_SUFFIXES = [
    ".supabase.co",
    ".supabase.in",
    "supabase.co",
    "supabase.in",
];

function allowedExtraHosts(): string[] {
    const hosts: string[] = [];
    for (const raw of [
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.NEXT_PUBLIC_APP_URL,
    ]) {
        if (!raw) continue;
        try {
            hosts.push(new URL(raw).hostname.toLowerCase());
        } catch {
            // ignore invalid env URLs
        }
    }
    return hosts;
}

function isAllowedImageUrl(rawUrl: string): boolean {
    try {
        const url = new URL(rawUrl);
        if (url.protocol !== "https:" && url.protocol !== "http:") {
            return false;
        }
        const host = url.hostname.toLowerCase();
        if (host === "localhost" || host === "127.0.0.1") {
            return true;
        }
        if (allowedExtraHosts().includes(host)) {
            return true;
        }
        return ALLOWED_HOST_SUFFIXES.some(
            (suffix) => host === suffix.replace(/^\./, "") || host.endsWith(suffix),
        );
    } catch {
        return false;
    }
}

export async function GET(request: NextRequest) {
    try {
        await requireAdmin(request, ["admin"]);
    } catch (err) {
        const { httpResponse, statusCode } = err as RouteError;
        if (httpResponse) return httpResponse;
        const status = statusCode ?? 401;
        return NextResponse.json(
            { error: status === 403 ? "Forbidden" : "Unauthorized" },
            { status },
        );
    }

    const targetUrl = request.nextUrl.searchParams.get("url");
    if (!targetUrl || !isAllowedImageUrl(targetUrl)) {
        return NextResponse.json({ error: "Invalid image URL" }, { status: 400 });
    }

    try {
        const upstream = await fetch(targetUrl, { cache: "no-store" });
        if (!upstream.ok) {
            return NextResponse.json({ error: "Image not found" }, { status: upstream.status });
        }

        const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
        const buffer = await upstream.arrayBuffer();

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "private, max-age=300",
            },
        });
    } catch (err) {
        console.error("Flyer image proxy failed:", err);
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
    }
}
