import { fileToExportableDataUrl } from "@/lib/post-generator/uploadImage";

describe("fileToExportableDataUrl", () => {
    it("rejects HEIC files with a clear message", async () => {
        const file = new File([new Uint8Array([0, 1, 2])], "photo.heic", {
            type: "image/heic",
        });
        await expect(fileToExportableDataUrl(file)).rejects.toThrow(/HEIC/i);
    });

    it("rejects non-image files", async () => {
        const file = new File(["hello"], "notes.txt", { type: "text/plain" });
        await expect(fileToExportableDataUrl(file)).rejects.toThrow(/JPG|PNG|WEBP/i);
    });
});
