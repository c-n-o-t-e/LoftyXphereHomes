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
