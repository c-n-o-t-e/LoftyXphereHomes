import {
    createAnalysisRunTracker,
    resolveHeroImageAnalysisAction,
    shouldCommitSmartThemeAnalysis,
} from "@/lib/post-generator/smart-theme/analysisRun";

describe("createAnalysisRunTracker", () => {
    it("treats an older begin() as stale after a newer run starts", () => {
        const tracker = createAnalysisRunTracker();
        const photoA = tracker.begin();
        const photoB = tracker.begin();
        expect(tracker.isCurrent(photoA)).toBe(false);
        expect(tracker.isCurrent(photoB)).toBe(true);
    });

    it("invalidate() drops in-flight runs (photo cleared)", () => {
        const tracker = createAnalysisRunTracker();
        const photoA = tracker.begin();
        tracker.invalidate();
        expect(tracker.isCurrent(photoA)).toBe(false);
        const photoB = tracker.begin();
        expect(tracker.isCurrent(photoB)).toBe(true);
    });
});

describe("shouldCommitSmartThemeAnalysis", () => {
    it("commits only when the run is current and the hero url still matches", () => {
        const tracker = createAnalysisRunTracker();
        const runId = tracker.begin();
        expect(
            shouldCommitSmartThemeAnalysis({
                runId,
                tracker,
                analyzedUrl: "https://cdn.example/a.jpg",
                currentImageUrl: "https://cdn.example/a.jpg",
            }),
        ).toBe(true);
    });

    it("rejects a completed analysis for a photo that was replaced", () => {
        const tracker = createAnalysisRunTracker();
        const photoA = tracker.begin();
        tracker.begin();
        expect(
            shouldCommitSmartThemeAnalysis({
                runId: photoA,
                tracker,
                analyzedUrl: "https://cdn.example/a.jpg",
                currentImageUrl: "https://cdn.example/b.jpg",
            }),
        ).toBe(false);
    });

    it("rejects when the hero photo was removed", () => {
        const tracker = createAnalysisRunTracker();
        const runId = tracker.begin();
        expect(
            shouldCommitSmartThemeAnalysis({
                runId,
                tracker,
                analyzedUrl: "https://cdn.example/a.jpg",
                currentImageUrl: null,
            }),
        ).toBe(false);
    });
});

describe("resolveHeroImageAnalysisAction", () => {
    it("does not consume the first-load sentinel while the template is still fetching", () => {
        const action = resolveHeroImageAnalysisAction({
            hasHydratedDocument: false,
            imageUrl: null,
            previousUrl: undefined,
        });
        expect(action).toEqual({ type: "none", previousUrl: undefined });
    });

    it("analyzes the saved hero without auto-applying after the template hydrates", () => {
        const afterMount = resolveHeroImageAnalysisAction({
            hasHydratedDocument: false,
            imageUrl: null,
            previousUrl: undefined,
        });
        const afterLoad = resolveHeroImageAnalysisAction({
            hasHydratedDocument: true,
            imageUrl: "https://cdn.example/saved.jpg",
            previousUrl: afterMount.previousUrl,
        });
        expect(afterLoad).toEqual({
            type: "analyze",
            imageUrl: "https://cdn.example/saved.jpg",
            autoApply: false,
            previousUrl: "https://cdn.example/saved.jpg",
        });
    });

    it("auto-applies when the user later changes the hero photo", () => {
        const action = resolveHeroImageAnalysisAction({
            hasHydratedDocument: true,
            imageUrl: "https://cdn.example/upload.jpg",
            previousUrl: "https://cdn.example/saved.jpg",
        });
        expect(action).toEqual({
            type: "analyze",
            imageUrl: "https://cdn.example/upload.jpg",
            autoApply: true,
            previousUrl: "https://cdn.example/upload.jpg",
        });
    });

    it("treats the first photo on an empty template as a user change", () => {
        const hydratedEmpty = resolveHeroImageAnalysisAction({
            hasHydratedDocument: true,
            imageUrl: null,
            previousUrl: undefined,
        });
        expect(hydratedEmpty.type).toBe("clear");
        const uploaded = resolveHeroImageAnalysisAction({
            hasHydratedDocument: true,
            imageUrl: "https://cdn.example/new.jpg",
            previousUrl: hydratedEmpty.previousUrl,
        });
        expect(uploaded).toMatchObject({ type: "analyze", autoApply: true });
    });

    it("ignores unchanged urls after hydrate", () => {
        const action = resolveHeroImageAnalysisAction({
            hasHydratedDocument: true,
            imageUrl: "https://cdn.example/saved.jpg",
            previousUrl: "https://cdn.example/saved.jpg",
        });
        expect(action).toEqual({
            type: "none",
            previousUrl: "https://cdn.example/saved.jpg",
        });
    });

    it("does not auto-apply when navigating to another template while the old document is still mounted", () => {
        const whileStale = resolveHeroImageAnalysisAction({
            hasHydratedDocument: true,
            imageUrl: "https://cdn.example/template-a.jpg",
            previousUrl: "https://cdn.example/template-a.jpg",
            routeTemplateId: "template-b",
            loadedTemplateId: "template-a",
        });
        expect(whileStale).toEqual({ type: "none", previousUrl: undefined });

        const afterNewLoad = resolveHeroImageAnalysisAction({
            hasHydratedDocument: true,
            imageUrl: "https://cdn.example/template-b.jpg",
            previousUrl: whileStale.previousUrl,
            routeTemplateId: "template-b",
            loadedTemplateId: "template-b",
        });
        expect(afterNewLoad).toEqual({
            type: "analyze",
            imageUrl: "https://cdn.example/template-b.jpg",
            autoApply: false,
            previousUrl: "https://cdn.example/template-b.jpg",
        });
    });
});
