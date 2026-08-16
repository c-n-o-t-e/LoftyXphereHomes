/**
 * Guards overlapping Smart Theme analyses. Each begin() invalidates older
 * in-flight runs so a slower photo A cannot overwrite photo B's results.
 */
export function createAnalysisRunTracker() {
    let latestRunId = 0;

    return {
        begin(): number {
            latestRunId += 1;
            return latestRunId;
        },
        /** Drop in-flight work (photo removed or replaced before a new analysis starts). */
        invalidate(): void {
            latestRunId += 1;
        },
        isCurrent(runId: number): boolean {
            return runId === latestRunId;
        },
    };
}

export type AnalysisRunTracker = ReturnType<typeof createAnalysisRunTracker>;

export function shouldCommitSmartThemeAnalysis(args: {
    runId: number;
    tracker: Pick<AnalysisRunTracker, "isCurrent">;
    analyzedUrl: string;
    currentImageUrl: string | null | undefined;
}): boolean {
    return (
        args.tracker.isCurrent(args.runId) &&
        args.currentImageUrl != null &&
        args.currentImageUrl === args.analyzedUrl
    );
}

export type HeroImageAnalysisAction =
    | { type: "none"; previousUrl: string | null | undefined }
    | {
          type: "analyze";
          imageUrl: string;
          autoApply: boolean;
          previousUrl: string | null;
      }
    | { type: "clear"; previousUrl: null };

/**
 * First paint has no document yet. Do not spend the "initial photo" sentinel
 * on that null — otherwise the saved hero URL looks like a user upload and
 * smart-theme patches overwrite the stored layout.
 *
 * Soft-navigating between templates can reuse the same client instance. While
 * the previous document is still on screen, its hero URL must not count as a
 * user change for the new route.
 */
export function resolveHeroImageAnalysisAction(args: {
    hasHydratedDocument: boolean;
    imageUrl: string | null;
    previousUrl: string | null | undefined;
    routeTemplateId?: string;
    loadedTemplateId?: string | null;
}): HeroImageAnalysisAction {
    const documentMatchesRoute =
        args.routeTemplateId == null ||
        args.loadedTemplateId === args.routeTemplateId;

    if (!args.hasHydratedDocument || !documentMatchesRoute) {
        return {
            type: "none",
            previousUrl: documentMatchesRoute ? args.previousUrl : undefined,
        };
    }

    const { imageUrl, previousUrl } = args;

    if (previousUrl === undefined) {
        if (!imageUrl) return { type: "clear", previousUrl: null };
        return {
            type: "analyze",
            imageUrl,
            autoApply: false,
            previousUrl: imageUrl,
        };
    }

    if (imageUrl === previousUrl) {
        return { type: "none", previousUrl };
    }

    if (!imageUrl) {
        return { type: "clear", previousUrl: null };
    }

    return {
        type: "analyze",
        imageUrl,
        autoApply: true,
        previousUrl: imageUrl,
    };
}

