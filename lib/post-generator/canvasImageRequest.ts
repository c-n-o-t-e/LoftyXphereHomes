/**
 * How to load an image for canvas pixel reads (theme analysis / export).
 * Remote hosts (Supabase) block CORS canvas reads — go through the admin proxy.
 */

export type CanvasImageRequest =
    | { kind: "direct"; src: string; useCors: boolean }
    | { kind: "proxy"; src: string; originalUrl: string };

export function adminImageProxyUrl(absoluteUrl: string): string {
    return `/api/admin/flyers/image-proxy?url=${encodeURIComponent(absoluteUrl)}`;
}

export function resolveCanvasImageRequest(
    imageUrl: string,
    origin?: string,
): CanvasImageRequest {
    if (!imageUrl) {
        return { kind: "direct", src: imageUrl, useCors: false };
    }
    if (imageUrl.startsWith("data:") || imageUrl.startsWith("blob:")) {
        return { kind: "direct", src: imageUrl, useCors: false };
    }
    if (imageUrl.startsWith("/")) {
        return { kind: "direct", src: imageUrl, useCors: false };
    }

    try {
        const parsed = new URL(imageUrl);
        const pageOrigin =
            origin ??
            (typeof window !== "undefined" ? window.location.origin : undefined);
        if (pageOrigin && parsed.origin === pageOrigin) {
            return { kind: "direct", src: imageUrl, useCors: false };
        }
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return {
                kind: "proxy",
                src: adminImageProxyUrl(imageUrl),
                originalUrl: imageUrl,
            };
        }
    } catch {
        // fall through
    }

    return { kind: "direct", src: imageUrl, useCors: true };
}
