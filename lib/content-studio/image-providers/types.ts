export type ImageGenerationRequest = {
    prompt: string;
    size?: "1024x1024" | "1024x1536" | "1536x1024";
    transparent?: boolean;
};

export type ImageGenerationResult = {
    imageUrl: string;
    provider: string;
    model: string;
    revisedPrompt?: string;
};

export interface ImageGenerationProvider {
    id: string;
    isConfigured(): boolean;
    generate(request: ImageGenerationRequest): Promise<ImageGenerationResult>;
}
