/**
 * Smart Theme Engine — isolated pipeline:
 * Image Upload → Image Analyzer → Theme Generator → Layout Generator → Instagram Renderer
 */

import { analyzeImageUrl } from "@/lib/post-generator/smart-theme/imageAnalyzer";
import {
    getCachedSmartTheme,
    imageCacheKey,
    setCachedSmartTheme,
} from "@/lib/post-generator/smart-theme/cache";
import {
    buildRecommendations,
    generateThemes,
    nextImaginativeExpression,
    pickRecommendedIndex,
} from "@/lib/post-generator/smart-theme/themeGenerator";
import { themeTokensToPatch } from "@/lib/post-generator/smart-theme/applyTheme";
import type {
    ImaginativeExpression,
    SmartThemeResult,
} from "@/lib/post-generator/smart-theme/types";
import type { PostDocument } from "@/lib/post-generator/types";

export type {
    SmartThemeResult,
    GeneratedThemeTokens,
    SmartRecommendation,
    SmartThemeId,
    ImageAnalysis,
    ImaginativeExpression,
} from "@/lib/post-generator/smart-theme/types";
export { themeTokensToPatch, themePreviewSwatches } from "@/lib/post-generator/smart-theme/applyTheme";
export { analyzePixelBuffer } from "@/lib/post-generator/smart-theme/imageAnalyzer";
export {
    clearSmartThemeCache,
    getCachedSmartTheme,
    imageCacheKey,
} from "@/lib/post-generator/smart-theme/cache";
export { nextImaginativeExpression } from "@/lib/post-generator/smart-theme/themeGenerator";

export type RunSmartThemeOptions = {
    /** Force re-analysis even if cached */
    force?: boolean;
    /**
     * Pin Imaginative expression (0 Soft / 1 Bold).
     * On force without this, expression toggles Soft ↔ Bold.
     */
    imaginativeExpression?: ImaginativeExpression;
};

/**
 * Analyze image (or return cache) and generate four theme suggestions + recommendations.
 * Re-analyze (force) keeps Luxury / Editorial / Dark Boutique stable and flips Imaginative Soft ↔ Bold.
 */
export async function runSmartThemeEngine(
    imageUrl: string,
    options: RunSmartThemeOptions = {},
): Promise<SmartThemeResult> {
    const key = imageCacheKey(imageUrl);
    const cached = getCachedSmartTheme(key);

    if (!options.force && cached) return cached;

    let imaginativeExpression: ImaginativeExpression =
        options.imaginativeExpression ?? 0;

    if (options.imaginativeExpression == null && options.force && cached) {
        imaginativeExpression = nextImaginativeExpression(
            cached.imaginativeExpression,
        );
    } else if (
        options.imaginativeExpression == null &&
        !options.force &&
        cached
    ) {
        // unreachable — early return above
        imaginativeExpression = cached.imaginativeExpression ?? 0;
    }

    const analysis =
        options.force && cached?.analysis
            ? cached.analysis
            : await analyzeImageUrl(imageUrl);

    const themes = generateThemes(analysis, { imaginativeExpression });
    let recommendedIndex = pickRecommendedIndex(analysis, themes);
    if (recommendedIndex < 0) recommendedIndex = 0;
    const recommended = themes[recommendedIndex]!;
    const recommendations = buildRecommendations(analysis, recommended);

    const result: SmartThemeResult = {
        imageKey: key,
        analyzedAt: Date.now(),
        analysis,
        themes,
        recommendedIndex,
        recommendations,
        imaginativeExpression,
    };
    setCachedSmartTheme(result);
    return result;
}

export function applySmartThemeToDocument(
    document: PostDocument,
    result: SmartThemeResult,
    themeIndex = result.recommendedIndex,
): Partial<PostDocument> {
    const theme = result.themes[themeIndex] ?? result.themes[0];
    if (!theme) return {};
    return themeTokensToPatch(theme, document);
}
