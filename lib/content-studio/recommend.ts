import { recommendTheme } from "@/lib/content-studio/smart-color-advisor";
import { recommendLayout } from "@/lib/content-studio/smart-layout-advisor";
import { visualConceptsFor } from "@/lib/content-studio/visual-concept";
import type { ContentCategory, LayoutRecommendation } from "@/lib/content-studio/types";

export function recommendEditorialDesign(input: {
    title?: string;
    category?: ContentCategory;
    keywords?: string[];
}): LayoutRecommendation {
    const layout = recommendLayout(input);
    const color = recommendTheme({
        category: input.category,
        title: input.title,
        keywords: input.keywords,
    });
    const visuals = visualConceptsFor({
        title: input.title,
        category: input.category,
        keywords: input.keywords,
        assetCategory: layout.assetCategory,
    });

    return {
        ...layout,
        themeId: color.themeId,
        visualConcept: visuals.concepts[0],
        visualConcepts: [...visuals.concepts],
        assetCategory: visuals.category,
        reason: `${layout.reason} ${color.reason}`,
    };
}
