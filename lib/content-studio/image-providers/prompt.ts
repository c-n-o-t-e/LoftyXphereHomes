const STYLE_LOCK = [
    "premium editorial photography",
    "luxury hospitality aesthetic",
    "soft studio lighting",
    "warm cream environment",
    "champagne highlights",
    "realistic materials",
    "refined proportions",
    "subtle natural shadow",
    "isolated object",
    "transparent background",
    "no text",
    "no letters",
    "no logos",
    "no watermark",
    "no people",
    "no clutter",
    "no cartoon",
    "no illustration",
    "no neon",
].join(", ");

export function buildAssetPrompt(concept: string): string {
    const cleaned = concept.replace(/\s+/g, " ").trim();
    return `${cleaned}. ${STYLE_LOCK}.`;
}
