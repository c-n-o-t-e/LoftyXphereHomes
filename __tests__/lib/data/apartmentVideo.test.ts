import { readFileSync } from "fs";
import { join } from "path";
import {
    serializeApartmentVideo,
    type ApartmentVideoRow,
} from "@/lib/data/apartmentVideo";

describe("public apartment video reads", () => {
    it("does not import sharp or ffmpeg processing", () => {
        const src = readFileSync(
            join(process.cwd(), "lib/data/apartmentVideo.ts"),
            "utf8",
        );
        expect(src).not.toMatch(/sharp/);
        expect(src).not.toMatch(/videos\/process/);
        expect(src).not.toMatch(/admin\/apartmentVideo/);
    });

    it("serializes a database row for the apartment page", () => {
        const row: ApartmentVideoRow = {
            id: "vid-1",
            apartmentId: "skyline-suite",
            mobileMp4Url: "https://cdn.example/mobile.mp4",
            desktopMp4Url: "https://cdn.example/desktop.mp4",
            posterUrl: "https://cdn.example/poster.jpg",
            storageKeyBase: "apartments/skyline-suite/vid-1",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-03T00:00:00.000Z"),
        };

        expect(serializeApartmentVideo(row)).toEqual({
            id: "vid-1",
            apartmentId: "skyline-suite",
            mobileMp4Url: "https://cdn.example/mobile.mp4",
            desktopMp4Url: "https://cdn.example/desktop.mp4",
            posterUrl: "https://cdn.example/poster.jpg",
            updatedAt: "2026-01-03T00:00:00.000Z",
        });
    });
});
