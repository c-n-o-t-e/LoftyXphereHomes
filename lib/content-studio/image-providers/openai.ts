import type {
    ImageGenerationProvider,
    ImageGenerationRequest,
    ImageGenerationResult,
} from "@/lib/content-studio/image-providers/types";

export class OpenAIImageProvider implements ImageGenerationProvider {
    id = "openai";

    isConfigured(): boolean {
        return Boolean(process.env.OPENAI_API_KEY?.trim());
    }

    async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
        const key = process.env.OPENAI_API_KEY?.trim();
        if (!key) throw new Error("OPENAI_API_KEY is not configured");

        const model = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
        const body: Record<string, unknown> = {
            model,
            prompt: request.prompt,
            n: 1,
            size: request.size ?? "1024x1536",
        };

        if (model.startsWith("gpt-image")) {
            body.quality = "high";
            body.background = request.transparent === false ? "opaque" : "transparent";
            body.output_format = "png";
        }

        const response = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const data = (await response.json()) as {
            error?: { message?: string };
            data?: Array<{ b64_json?: string; url?: string; revised_prompt?: string }>;
        };

        if (!response.ok) {
            throw new Error(data.error?.message ?? "OpenAI image generation failed");
        }

        const first = data.data?.[0];
        if (!first) throw new Error("OpenAI returned no image");

        const imageUrl = first.b64_json
            ? `data:image/png;base64,${first.b64_json}`
            : first.url;
        if (!imageUrl) throw new Error("OpenAI returned an empty image");

        return {
            imageUrl,
            provider: this.id,
            model,
            revisedPrompt: first.revised_prompt,
        };
    }
}
