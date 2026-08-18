import type {
    ImageGenerationProvider,
    ImageGenerationRequest,
    ImageGenerationResult,
} from "@/lib/content-studio/image-providers/types";

function svgPlaceholder(label: string, accent: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1280" viewBox="0 0 1024 1280">
  <rect width="1024" height="1280" fill="none"/>
  <ellipse cx="512" cy="1080" rx="210" ry="36" fill="rgba(36,26,20,0.10)"/>
  <rect x="312" y="360" width="400" height="520" rx="28" fill="#EEE1D0" stroke="${accent}" stroke-width="3"/>
  <rect x="352" y="420" width="320" height="200" rx="12" fill="#F6EFE3"/>
  <circle cx="512" cy="720" r="54" fill="none" stroke="${accent}" stroke-width="3"/>
  <text x="512" y="980" text-anchor="middle" fill="#5B4636" font-family="Georgia, serif" font-size="28">${escapeXml(label)}</text>
</svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export class StubImageProvider implements ImageGenerationProvider {
    id = "stub";

    isConfigured(): boolean {
        return true;
    }

    async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
        const short = request.prompt.split(",")[0]?.slice(0, 42) || "Editorial object";
        return {
            imageUrl: svgPlaceholder(short, "#C8A66A"),
            provider: this.id,
            model: "lxh-placeholder",
        };
    }
}
