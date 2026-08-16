import type { ImageAnalysis } from "@/lib/post-generator/smart-theme/types";

/**
 * Prefer overlapping flooring / blank walls / low-detail lower regions.
 * Returns cardOffsetY in px (negative raises the glass card).
 */
export function suggestCardOffsetY(analysis: ImageAnalysis): number {
    const band = analysis.lowerBandComplexity;
    if (!band.length) {
        // Default editorial lift
        return -40;
    }

    // Find the quietest slice in the lower band
    let bestIdx = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let i = 0; i < band.length; i++) {
        const score = band[i] ?? 1;
        if (score < bestScore) {
            bestScore = score;
            bestIdx = i;
        }
    }

    // Busy lower band → raise card (more negative) to sit on quieter zone above
    const busyPenalty = Math.max(0, bestScore - 0.18) * 90;
    // Subject low in frame → raise further
    const subjectPush = analysis.subjectCentroid.y > 0.55 ? 18 : 0;
    // High complexity overall → slightly higher card
    const complexityPush = analysis.complexity > 0.45 ? 12 : 0;

    // Map quiet index: 0 = higher in lower band → less lift needed
    const bandLift = (band.length - 1 - bestIdx) * 8;

    const offset = -28 - busyPenalty - subjectPush - complexityPush - bandLift;
    return Math.round(Math.max(-72, Math.min(-12, offset)));
}

export function suggestPhotoFadePercent(analysis: ImageAnalysis): number {
    // Soften more when lower band is busy so furniture dissolves into ivory
    const lowerAvg =
        analysis.lowerBandComplexity.reduce((a, b) => a + b, 0) /
        Math.max(1, analysis.lowerBandComplexity.length);
    const fade = 10 + lowerAvg * 18 + analysis.complexity * 6;
    return Math.round(Math.max(10, Math.min(28, fade)));
}

/**
 * Alternate layout for Imaginative expression B — opposite lift bias so
 * re-analyze feels like a different composition, not a colour-only flip.
 */
export function suggestAlternateCardOffsetY(analysis: ImageAnalysis): number {
    const primary = suggestCardOffsetY(analysis);
    // Push the other way within editorial bounds (still negative = overlap photo)
    const flipped = primary + 28;
    return Math.round(Math.max(-72, Math.min(-12, flipped)));
}

export function suggestAlternatePhotoFadePercent(analysis: ImageAnalysis): number {
    const primary = suggestPhotoFadePercent(analysis);
    return Math.round(Math.max(10, Math.min(28, primary + 6)));
}

export function describeLayoutChoice(
    analysis: ImageAnalysis,
    cardOffsetY: number,
): string {
    const lowerAvg =
        analysis.lowerBandComplexity.reduce((a, b) => a + b, 0) /
        Math.max(1, analysis.lowerBandComplexity.length);
    const lift = Math.abs(Math.round(cardOffsetY));
    if (lowerAvg > 0.35 || analysis.subjectCentroid.y > 0.58) {
        return `Overlay shifted ${lift}px upward to avoid covering furniture / focal detail`;
    }
    if (analysis.emptyRegions[0] && analysis.emptyRegions[0].complexity < 0.15) {
        return `Overlay aligned over a low-detail region (${lift}px lift)`;
    }
    return `Overlay offset ${lift}px for balanced photo + editorial overlap`;
}
