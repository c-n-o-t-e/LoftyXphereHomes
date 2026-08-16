import type { SmartThemeResult } from "@/lib/post-generator/smart-theme/types";

const cache = new Map<string, SmartThemeResult>();

export function getCachedSmartTheme(imageKey: string): SmartThemeResult | null {
    return cache.get(imageKey) ?? null;
}

export function setCachedSmartTheme(result: SmartThemeResult): void {
    cache.set(result.imageKey, result);
}

export function clearSmartThemeCache(imageKey?: string): void {
    if (imageKey) cache.delete(imageKey);
    else cache.clear();
}

/** Stable key for data URLs / remote URLs (truncate huge data URLs). */
export function imageCacheKey(url: string): string {
    // Bump prefix when theme set / generator shape changes (e.g. 3 → 4 themes)
    const version = "v3";
    if (url.startsWith("data:")) {
        const head = url.slice(0, 64);
        const tail = url.slice(-48);
        return `${version}:data:${url.length}:${head}:${tail}`;
    }
    return `${version}:${url}`;
}
