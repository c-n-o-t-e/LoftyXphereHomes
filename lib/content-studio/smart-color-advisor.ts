import { resolveTheme } from "@/lib/content-studio/brand-theme";
import { themeForCategory } from "@/lib/content-studio/smart-layout-advisor";
import type {
    ContentCategory,
    StudioTheme,
    ThemeId,
} from "@/lib/content-studio/types";

const SEASONAL_WORDS = /\bholiday|christmas|eid|festive|harmattan|rainy|december\b/i;
const DARK_WORDS = /\bannouncement|now open|sold out|invitation|after dark\b/i;

export function recommendTheme(input: {
    category?: ContentCategory;
    title?: string;
    keywords?: string[];
}): { themeId: ThemeId; theme: StudioTheme; reason: string } {
    const text = `${input.title ?? ""} ${(input.keywords ?? []).join(" ")}`;

    if (SEASONAL_WORDS.test(text)) {
        return {
            themeId: "seasonal",
            theme: resolveTheme("seasonal"),
            reason: "Seasonal language uses ivory, gold, and a controlled terracotta accent.",
        };
    }

    if (DARK_WORDS.test(text) || input.category === "announcement" || input.category === "promotion") {
        return {
            themeId: "dark-editorial",
            theme: resolveTheme("dark-editorial"),
            reason: "Announcements and invitations hold more authority on charcoal.",
        };
    }

    const themeId = input.category
        ? themeForCategory(input.category)
        : "luxury-editorial";

    return {
        themeId,
        theme: resolveTheme(themeId),
        reason: "Accent stays inside the warm luxury system — no new colours.",
    };
}
