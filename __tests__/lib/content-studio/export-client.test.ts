describe("content-studio export client API", () => {
    it("exports the public helpers", async () => {
        const mod = await import("@/lib/content-studio/export-client");
        expect(typeof mod.exportEditorialDocument).toBe("function");
        expect(typeof mod.renderEditorialToCanvas).toBe("function");
        expect(typeof mod.resolveStudioExportFileName).toBe("function");
        expect(typeof mod.sanitizeStudioFileName).toBe("function");
    });

    it("names downloads from the headline", async () => {
        const { resolveStudioExportFileName, sanitizeStudioFileName } = await import(
            "@/lib/content-studio/export-client"
        );
        const { createDefaultEditorialDocument } = await import(
            "@/lib/content-studio/defaults"
        );

        expect(sanitizeStudioFileName("Happy New Week!")).toBe("Happy New Week!");
        const document = createDefaultEditorialDocument({
            category: "new-week",
            layoutId: "minimal-luxury",
        });
        document.content.title = "Happy New Week";
        expect(resolveStudioExportFileName(document)).toBe("happy-new-week");
    });
});
