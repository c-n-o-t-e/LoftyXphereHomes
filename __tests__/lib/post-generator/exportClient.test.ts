/**
 * Export client is browser-only (Canvas / File / Share).
 * These tests lock the public API surface so call sites stay wired correctly.
 */

describe("post-generator exportClient API", () => {
    it("exports exportPostDocument as a function", async () => {
        // Dynamic import keeps this suite from requiring a DOM at module load
        // in environments that tree-shake the canvas path.
        const mod = await import("@/lib/post-generator/exportClient");
        expect(typeof mod.exportPostDocument).toBe("function");
        expect(typeof mod.exportPostCanvas).toBe("function");
        expect(typeof mod.resolvePostExportFileName).toBe("function");
        expect(typeof mod.sanitizeExportBaseName).toBe("function");
        expect(typeof mod.heroPhotoCropRect).toBe("function");
    });

    it("applies crop insets the same way as the live preview", async () => {
        const { heroPhotoCropRect } = await import("@/lib/post-generator/exportClient");
        const full = heroPhotoCropRect(1080, 837, {
            cropTop: 0,
            cropRight: 0,
            cropBottom: 0,
            cropLeft: 0,
        });
        expect(full).toEqual({ x: 0, y: 0, width: 1080, height: 837 });

        const cropped = heroPhotoCropRect(1080, 800, {
            cropTop: 10,
            cropRight: 5,
            cropBottom: 20,
            cropLeft: 5,
        });
        expect(cropped.x).toBe(54);
        expect(cropped.y).toBe(80);
        expect(cropped.width).toBe(972);
        expect(cropped.height).toBe(560);

        const clamped = heroPhotoCropRect(1000, 1000, {
            cropTop: 90,
            cropRight: 90,
            cropBottom: 90,
            cropLeft: 90,
        });
        expect(clamped.x).toBe(400);
        expect(clamped.y).toBe(400);
        expect(clamped.width).toBe(200);
        expect(clamped.height).toBe(200);
    });

    it("names downloads after the uploaded file stem", async () => {
        const { resolvePostExportFileName, sanitizeExportBaseName } =
            await import("@/lib/post-generator/exportClient");
        const { createDefaultPostDocument } = await import(
            "@/lib/post-generator/defaults"
        );

        expect(sanitizeExportBaseName("section one.jpg")).toBe("section one");
        expect(sanitizeExportBaseName("My Suite/Photo?.png")).toBe("My SuitePhoto");

        const uploaded = createDefaultPostDocument({
            image: {
                ...createDefaultPostDocument().image,
                url: "data:image/jpeg;base64,xx",
                sourceFileName: "section one.jpg",
            },
        });
        expect(resolvePostExportFileName(uploaded)).toBe("section one");

        const suite = createDefaultPostDocument({
            apartmentSlug: "meridian-suite",
            image: {
                ...createDefaultPostDocument().image,
                sourceFileName: null,
            },
        });
        expect(resolvePostExportFileName(suite)).toBe("lofty-meridian-suite-post");
    });

    it("exportPostCanvas rejects without a document", async () => {
        const { exportPostCanvas } = await import("@/lib/post-generator/exportClient");
        const el = { tagName: "DIV" } as unknown as HTMLElement;
        await expect(
            exportPostCanvas(el, { format: "png", scale: 1 }),
        ).rejects.toThrow(/exportPostDocument/i);
    });
});
