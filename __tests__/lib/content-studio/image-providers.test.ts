import { buildAssetPrompt } from "@/lib/content-studio/image-providers/prompt";
import { StubImageProvider } from "@/lib/content-studio/image-providers/stub";

describe("content-studio image providers", () => {
    it("locks the editorial style onto every prompt", () => {
        const prompt = buildAssetPrompt("A brass hotel room key");
        expect(prompt).toContain("transparent background");
        expect(prompt).toContain("no text");
        expect(prompt).toContain("luxury hospitality advertising quality");
        expect(prompt).toContain("no cartoon");
        expect(prompt).toContain("no neon");
        expect(prompt).toContain("no anime");
    });

    it("stub provider returns a data URL so the studio works without keys", async () => {
        const provider = new StubImageProvider();
        const result = await provider.generate({
            prompt: "A brass hotel room key, isolated",
        });
        expect(result.provider).toBe("stub");
        expect(result.imageUrl.startsWith("data:image/svg+xml")).toBe(true);
    });
});
