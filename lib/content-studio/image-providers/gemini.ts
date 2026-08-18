import type {
    ImageGenerationProvider,
    ImageGenerationRequest,
    ImageGenerationResult,
} from "@/lib/content-studio/image-providers/types";

export class GeminiImageProvider implements ImageGenerationProvider {
    id = "gemini";

    isConfigured(): boolean {
        return Boolean(process.env.GEMINI_API_KEY?.trim());
    }

    async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
        const key = process.env.GEMINI_API_KEY?.trim();
        if (!key) throw new Error("GEMINI_API_KEY is not configured");

        const model =
            process.env.GEMINI_IMAGE_MODEL?.trim() || "imagen-4.0-generate-001";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${encodeURIComponent(key)}`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [{ prompt: request.prompt }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "3:4",
                },
            }),
        });

        const data = (await response.json()) as {
            error?: { message?: string };
            predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
        };

        if (!response.ok) {
            throw new Error(data.error?.message ?? "Gemini image generation failed");
        }

        const bytes = data.predictions?.[0]?.bytesBase64Encoded;
        const mime = data.predictions?.[0]?.mimeType ?? "image/png";
        if (!bytes) throw new Error("Gemini returned no image");

        return {
            imageUrl: `data:${mime};base64,${bytes}`,
            provider: this.id,
            model,
        };
    }
}
