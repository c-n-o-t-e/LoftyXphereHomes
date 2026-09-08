import type {
    ImageGenerationProvider,
    ImageGenerationRequest,
    ImageGenerationResult,
} from "@/lib/content-studio/image-providers/types";
import { editorialPlaceholderSrc } from "@/lib/content-studio/placeholders";
import type { AssetCategory } from "@/lib/content-studio/types";

function categoryFromPrompt(prompt: string): AssetCategory {
    const text = prompt.toLowerCase();
    if (/\babuja|skyline|landmark\b/.test(text)) return "abuja";
    if (/\bsuitcase|luggage|passport\b/.test(text)) return "travel";
    if (/\bcoffee|crate|fruit|pastry\b/.test(text)) return "food";
    if (/\blaptop|briefcase\b/.test(text)) return "business";
    if (/\bcandle|throw|vase\b/.test(text)) return "seasonal";
    if (/\bchampagne|gift|flower\b/.test(text)) return "celebrations";
    if (/\brobe|carafe|yoga\b/.test(text)) return "wellness";
    return "hospitality";
}

export class StubImageProvider implements ImageGenerationProvider {
    id = "stub";

    isConfigured(): boolean {
        return true;
    }

    async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
        const treatment = request.transparent === false ? "hero" : "cutout";
        return {
            imageUrl: editorialPlaceholderSrc(categoryFromPrompt(request.prompt), treatment),
            provider: this.id,
            model: "lxh-placeholder",
        };
    }
}
