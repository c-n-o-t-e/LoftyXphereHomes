import type {
    AssetCategory,
    ContentCategory,
    FooterVariant,
    LayoutId,
    LayoutRecommendation,
    ThemeId,
} from "@/lib/content-studio/types";

const CATEGORY_LAYOUTS: Record<ContentCategory, LayoutId[]> = {
    educational: ["magazine-editorial", "full-bleed", "information-grid"],
    "travel-tips": ["cut-out", "editorial-split", "full-bleed", "magazine-editorial"],
    "abuja-guide": ["full-bleed", "magazine-editorial", "cut-out"],
    "guest-tips": ["information-grid", "magazine-editorial", "cut-out"],
    hospitality: ["typography-first", "editorial-split", "minimal-luxury"],
    lifestyle: ["editorial-split", "cut-out", "magazine-editorial"],
    inspirational: ["typography-first", "minimal-luxury", "editorial-split"],
    "new-week": ["minimal-luxury", "typography-first", "editorial-split"],
    "new-month": ["minimal-luxury", "typography-first", "editorial-split"],
    holiday: ["editorial-split", "full-bleed", "minimal-luxury"],
    announcement: ["full-bleed", "minimal-luxury", "magazine-editorial"],
    promotion: ["full-bleed", "magazine-editorial", "editorial-split"],
    "local-discovery": ["full-bleed", "magazine-editorial", "cut-out"],
    wellness: ["cut-out", "typography-first", "information-grid"],
    "business-travel": ["information-grid", "magazine-editorial", "cut-out"],
};

const CATEGORY_THEMES: Record<ContentCategory, ThemeId> = {
    educational: "luxury-editorial",
    "travel-tips": "warm-hospitality",
    "abuja-guide": "luxury-editorial",
    "guest-tips": "warm-hospitality",
    hospitality: "warm-hospitality",
    lifestyle: "luxury-editorial",
    inspirational: "luxury-editorial",
    "new-week": "luxury-editorial",
    "new-month": "luxury-editorial",
    holiday: "seasonal",
    announcement: "dark-editorial",
    promotion: "dark-editorial",
    "local-discovery": "warm-hospitality",
    wellness: "luxury-editorial",
    "business-travel": "warm-hospitality",
};

const CATEGORY_ASSETS: Record<ContentCategory, AssetCategory> = {
    educational: "accommodation",
    "travel-tips": "travel",
    "abuja-guide": "abuja",
    "guest-tips": "hospitality",
    hospitality: "hospitality",
    lifestyle: "lifestyle",
    inspirational: "hospitality",
    "new-week": "lifestyle",
    "new-month": "seasonal",
    holiday: "celebrations",
    announcement: "accommodation",
    promotion: "hospitality",
    "local-discovery": "food",
    wellness: "wellness",
    "business-travel": "business",
};

const LISTICLE = /\b(\d+|five|three|seven|two)\s+(things|ways|places|tips|reasons)\b/i;
const BEFORE_BOOK = /\bbefore (you )?book|\bwhat to know\b|\bcheck before\b/i;
const PACK = /\bpack\b|\bluggage\b|\bsuitcase\b/i;
const PLACES = /\bplaces to (visit|eat|see|go)\b|\bnear wuye\b|\babuja guide\b|\bhidden gems\b|\bexplore abuja\b/i;
const STATEMENT = /\bmore than a room\b|\bwhy a great stay\b|\bphilosophy\b|\bexperience\b/i;
const CHOOSE = /\bwhy choose\b|\bserviced apartment\b|\breasons to\b/i;
const NEW_WEEK = /\bhappy new week\b|\bnew week\b/i;
const NEW_MONTH = /\bhappy new month\b|\bnew month\b|\bwelcome the month\b/i;
const QUOTE = /\bexperience\b|\bmore than a room\b|\bphilosophy\b/i;

export function recommendLayout(input: {
    title?: string;
    category?: ContentCategory;
    keywords?: string[];
}): LayoutRecommendation {
    const title = (input.title ?? "").trim();
    const category = input.category ?? inferCategory(title, input.keywords ?? []);
    const haystack = `${title} ${(input.keywords ?? []).join(" ")}`.toLowerCase();

    let layoutId: LayoutId;
    let reason: string;

    if (NEW_WEEK.test(title) || NEW_MONTH.test(title)) {
        layoutId = "minimal-luxury";
        reason = "Greeting posts should feel expensive through restraint.";
    } else if (PACK.test(haystack)) {
        layoutId = "cut-out";
        reason = "Packing and object-led tips belong on a floating cut-out asset.";
    } else if (/\bhidden gems\b|\bexplore abuja\b/i.test(haystack)) {
        layoutId = "editorial-split";
        reason = "Place-led lines work as an editorial split — headline one side, landmark the other.";
    } else if (PLACES.test(haystack)) {
        layoutId = "full-bleed";
        reason = "Destination lists should let the visual dominate.";
    } else if (CHOOSE.test(haystack)) {
        layoutId = "information-grid";
        reason = "Reason-led hospitality copy belongs on a structured information grid.";
    } else if (LISTICLE.test(title) || BEFORE_BOOK.test(title)) {
        layoutId = "magazine-editorial";
        reason = "Numbered or “what to know” titles read best as a magazine editorial.";
    } else if ((QUOTE.test(title) || STATEMENT.test(title)) && title.length > 32) {
        layoutId = "typography-first";
        reason = "A hospitality statement should be typography-led.";
    } else {
        layoutId = CATEGORY_LAYOUTS[category][0];
        reason = `Preferred layout for ${category.replace("-", " ")} content.`;
    }

    const preferred = CATEGORY_LAYOUTS[category];
    const alternatives = preferred.filter((id) => id !== layoutId).slice(0, 2);
    if (!preferred.includes(layoutId)) {
        alternatives.unshift(preferred[0]);
    }

    return {
        layoutId,
        alternatives: alternatives.slice(0, 2),
        themeId: CATEGORY_THEMES[category],
        visualConcept: "",
        visualConcepts: [],
        assetCategory: CATEGORY_ASSETS[category],
        footer: footerForLayout(layoutId),
        reason,
    };
}

export function inferCategory(
    title: string,
    keywords: string[] = [],
): ContentCategory {
    const text = `${title} ${keywords.join(" ")}`.toLowerCase();
    if (NEW_WEEK.test(text)) return "new-week";
    if (NEW_MONTH.test(text)) return "new-month";
    if (/\bholiday|christmas|eid|festive\b/.test(text)) return "holiday";
    if (/\babuja|wuye|maitama|asokoro|jabi\b/.test(text)) return "abuja-guide";
    if (PACK.test(text) || /\btravel tip\b/.test(text)) return "travel-tips";
    if (/\bwellness|rest|sleep|gym\b/.test(text)) return "wellness";
    if (/\bwork stay|business|desk|meeting\b/.test(text)) return "business-travel";
    if (/\bbook|shortlet|check before\b/.test(text)) return "educational";
    if (/\bexperience|more than a room\b/.test(text)) return "inspirational";
    return "hospitality";
}

export function footerForLayout(layoutId: LayoutId): FooterVariant {
    if (layoutId === "information-grid") return "full";
    if (layoutId === "full-bleed") return "website-only";
    if (layoutId === "typography-first" || layoutId === "minimal-luxury") {
        return "logo-only";
    }
    return "micro";
}

export function preferredLayoutsForCategory(category: ContentCategory): LayoutId[] {
    return CATEGORY_LAYOUTS[category];
}

export function themeForCategory(category: ContentCategory): ThemeId {
    return CATEGORY_THEMES[category];
}

export function assetCategoryForContent(category: ContentCategory): AssetCategory {
    return CATEGORY_ASSETS[category];
}
