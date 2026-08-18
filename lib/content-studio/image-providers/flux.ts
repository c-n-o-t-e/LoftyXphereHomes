import type {
    ImageGenerationProvider,
    ImageGenerationRequest,
    ImageGenerationResult,
} from "@/lib/content-studio/image-providers/types";

export class FluxImageProvider implements ImageGenerationProvider {
    id = "flux";

    isConfigured(): boolean {
        return Boolean(process.env.REPLICATE_API_TOKEN?.trim());
    }

    async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
        const token = process.env.REPLICATE_API_TOKEN?.trim();
        if (!token) throw new Error("REPLICATE_API_TOKEN is not configured");

        const model =
            process.env.FLUX_MODEL?.trim() || "black-forest-labs/flux-1.1-pro";

        const create = await fetch("https://api.replicate.com/v1/predictions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Prefer: "wait",
            },
            body: JSON.stringify({
                version: model.includes(":") ? model.split(":")[1] : undefined,
                model: model.includes(":") ? undefined : model,
                input: {
                    prompt: request.prompt,
                    aspect_ratio: "3:4",
                    output_format: "png",
                    output_quality: 95,
                },
            }),
        });

        const data = (await create.json()) as {
            error?: string;
            output?: string | string[];
            status?: string;
        };

        if (!create.ok) {
            throw new Error(data.error ?? "FLUX image generation failed");
        }

        const output = Array.isArray(data.output) ? data.output[0] : data.output;
        if (!output) throw new Error("FLUX returned no image");

        return {
            imageUrl: output,
            provider: this.id,
            model,
        };
    }
}
