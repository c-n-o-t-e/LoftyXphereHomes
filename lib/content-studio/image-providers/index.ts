import { FluxImageProvider } from "@/lib/content-studio/image-providers/flux";
import { GeminiImageProvider } from "@/lib/content-studio/image-providers/gemini";
import { OpenAIImageProvider } from "@/lib/content-studio/image-providers/openai";
import { StubImageProvider } from "@/lib/content-studio/image-providers/stub";
import type { ImageGenerationProvider } from "@/lib/content-studio/image-providers/types";

export type { ImageGenerationProvider, ImageGenerationRequest, ImageGenerationResult } from "@/lib/content-studio/image-providers/types";

const PROVIDERS: ImageGenerationProvider[] = [
    new OpenAIImageProvider(),
    new GeminiImageProvider(),
    new FluxImageProvider(),
    new StubImageProvider(),
];

export function listConfiguredProviders(): ImageGenerationProvider[] {
    return PROVIDERS.filter((provider) => provider.isConfigured() && provider.id !== "stub");
}

export function resolveImageProvider(): ImageGenerationProvider {
    const preferred = process.env.CONTENT_STUDIO_IMAGE_PROVIDER?.trim().toLowerCase();
    if (preferred && preferred !== "auto" && preferred !== "stub") {
        const match = PROVIDERS.find((provider) => provider.id === preferred);
        if (match?.isConfigured()) return match;
        throw new Error(
            `Image provider "${preferred}" is not configured. Add the matching API key.`,
        );
    }

    const live = listConfiguredProviders();
    if (live[0]) return live[0];
    return new StubImageProvider();
}

export function isLiveImageProviderConfigured(): boolean {
    return listConfiguredProviders().length > 0;
}
