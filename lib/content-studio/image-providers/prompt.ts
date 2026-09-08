const STYLE_LOCK = [
    "LoftyXphere editorial asset style",
    "premium editorial realism",
    "sophisticated photorealistic rendering",
    "luxury hospitality advertising quality",
    "warm neutral lighting",
    "cream beige champagne environment",
    "subtle gold details",
    "realistic materials",
    "elegant controlled depth",
    "high-end boutique hotel aesthetic",
    "no text",
    "no letters",
    "no logos",
    "no watermark",
    "no people",
    "no clutter",
    "no cartoon",
    "no illustration",
    "no pixar",
    "no anime",
    "no clip art",
    "no neon",
    "no random background scenery behind the subject",
].join(", ");

const CUTOUT_LOCK = [
    "isolated object",
    "transparent background",
    "clean edges",
    "subtle natural contact shadow only",
    "subject occupies most of the frame",
    "studio product photography",
].join(", ");

const HERO_LOCK = [
    "full-bleed editorial photograph",
    "luxury travel magazine cover quality",
    "warm ivory and champagne colour grade",
    "cinematic but quiet",
    "no graphic overlays",
    "photograph fills the frame",
].join(", ");

export type AssetPromptTreatment = "cutout" | "hero" | "object" | "accent";

export function buildAssetPrompt(
    concept: string,
    treatment: AssetPromptTreatment = "cutout",
): string {
    const cleaned = concept.replace(/\s+/g, " ").trim();
    if (treatment === "hero") {
        return `${cleaned}. ${HERO_LOCK}. ${STYLE_LOCK}.`;
    }
    return `${cleaned}. ${CUTOUT_LOCK}. ${STYLE_LOCK}.`;
}
