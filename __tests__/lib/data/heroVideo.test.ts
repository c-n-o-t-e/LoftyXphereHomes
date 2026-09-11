import { readFileSync } from "fs";
import { join } from "path";
import { serializeHeroVideo, type HeroVideoRow } from "@/lib/data/heroVideo";

describe("public hero video reads", () => {
    it("does not import sharp or ffmpeg processing", () => {
        const src = readFileSync(join(process.cwd(), "lib/data/heroVideo.ts"), "utf8");
        expect(src).not.toMatch(/sharp/);
        expect(src).not.toMatch(/videos\/process/);
        expect(src).not.toMatch(/admin\/heroVideo/);
    });

    it("serializes a database row for the homepage", () => {
        const row: HeroVideoRow = {
            id: "hero-1",
            mobileMp4Url: "https://cdn.example/mobile.mp4",
            desktopMp4Url: "https://cdn.example/desktop.mp4",
            posterUrl: "https://cdn.example/poster.jpg",
            mobilePosterUrl: "https://cdn.example/mobile-poster.jpg",
            storageKeyBase: "hero/hero-1",
            isActive: true,
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-02T00:00:00.000Z"),
        };

        expect(serializeHeroVideo(row)).toEqual({
            id: "hero-1",
            mobileMp4Url: "https://cdn.example/mobile.mp4",
            desktopMp4Url: "https://cdn.example/desktop.mp4",
            posterUrl: "https://cdn.example/poster.jpg",
            mobilePosterUrl: "https://cdn.example/mobile-poster.jpg",
            updatedAt: "2026-01-02T00:00:00.000Z",
        });
    });
});
