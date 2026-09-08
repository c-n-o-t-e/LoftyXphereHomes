import { assetCategoryForContent } from "@/lib/content-studio/smart-layout-advisor";
import type { AssetCategory, ContentCategory } from "@/lib/content-studio/types";

const CONCEPT_BANK: Record<AssetCategory, [string, string, string]> = {
    travel: [
        "Elegant hotel key beside premium cognac travel luggage, isolated on a transparent background, refined hospitality editorial photography",
        "A navy passport, boarding wallet and champagne luggage tag as a still life, no readable text, transparent background",
        "Open leather weekender bag with folded ivory linen, warm studio light, isolated object",
    ],
    hospitality: [
        "A brass hotel room key on a cream leather fob, soft champagne highlights, isolated, no text",
        "A ceramic cup of black coffee on a linen napkin, steam barely visible, luxury hospitality still life",
        "Folded ivory towels with a single sprig of greenery, warm studio lighting, transparent background",
    ],
    lifestyle: [
        "A ceramic coffee cup on warm stone, editorial still life, isolated on transparent background",
        "An open linen notebook with a gold pen, pages blank, quiet luxury object",
        "Over-ear headphones in cognac leather, soft shadow, transparent background",
    ],
    food: [
        "A premium wooden crate of vegetables and citrus, isolated on transparent background, refined food editorial",
        "A breakfast plate of fruit and pastry on stoneware, warm ivory light, no logos, isolated",
        "A restaurant table setting for one — linen, glass, gold cutlery — isolated composition",
    ],
    abuja: [
        "An elegant isolated Abuja architectural landmark at golden hour, clean edges, transparent background, editorial realism",
        "A refined fragment of a modern Abuja skyline, no text, warm champagne light, isolated subject",
        "A contemporary city balcony planter with warm evening light, isolated photographic subject",
    ],
    business: [
        "A closed space-grey laptop beside a brass room key, hospitality-business still life, transparent background",
        "A leather laptop sleeve and fountain pen on warm oak, isolated, no text",
        "A slim briefcase in cognac leather, champagne hardware, transparent background",
    ],
    wellness: [
        "A linen robe folded with a small bottle of oil, spa still life, warm cream light",
        "A ceramic water carafe and glass on stone, quiet luxury, isolated",
        "Rolled sand-linen yoga mat with a single leaf, transparent background",
    ],
    fitness: [
        "A pair of refined leather gym weights on stone, editorial, no logos",
        "Minimal gym towel and brass water bottle, warm hospitality lighting",
        "Elegant dumbbells in champagne metal, isolated object, soft shadow",
    ],
    technology: [
        "A closed laptop in space grey on cream linen, no brands, isolated",
        "Wireless earbuds in a stone charging case, warm studio light",
        "A tablet standing with a stylus, editorial still life, transparent background",
    ],
    celebrations: [
        "A single champagne coupe with a gold rim, isolated, no text or labels",
        "A small arrangement of dried flowers in a ceramic vessel, seasonal still life",
        "A linen-wrapped gift box with champagne ribbon, transparent background",
    ],
    seasonal: [
        "A candle in smoked glass with a warm flame, isolated hospitality object",
        "A ceramic vase with dried grasses, ivory and gold palette",
        "A folded throw in camel wool, soft studio shadow, transparent background",
    ],
    accommodation: [
        "Elegant hotel key beside premium travel luggage, isolated on transparent background, refined hospitality editorial photography",
        "A brass room key, leather travel wallet and booking folder, no readable text",
        "An open guest book with a gold pen, pages blank, editorial still life",
    ],
};

const TITLE_HINTS: Array<{ pattern: RegExp; concepts: [string, string, string] }> = [
    {
        pattern: /\bpack|luggage|suitcase\b/i,
        concepts: CONCEPT_BANK.travel,
    },
    {
        pattern: /\bbook|shortlet|key|check\b/i,
        concepts: CONCEPT_BANK.accommodation,
    },
    {
        pattern: /\bcoffee|morning|breakfast|new week\b/i,
        concepts: CONCEPT_BANK.lifestyle,
    },
    {
        pattern: /\babuja|wuye|city|places|hidden gems|explore\b/i,
        concepts: CONCEPT_BANK.abuja,
    },
    {
        pattern: /\bmarket|produce|eat|food\b/i,
        concepts: CONCEPT_BANK.food,
    },
    {
        pattern: /\bchristmas|eid|holiday|festive\b/i,
        concepts: CONCEPT_BANK.celebrations,
    },
    {
        pattern: /\bweek|month|begin\b/i,
        concepts: CONCEPT_BANK.lifestyle,
    },
];

export function visualConceptsFor(input: {
    title?: string;
    category?: ContentCategory;
    keywords?: string[];
    assetCategory?: AssetCategory;
}): { category: AssetCategory; concepts: [string, string, string] } {
    const title = input.title ?? "";
    const hinted = TITLE_HINTS.find((entry) => entry.pattern.test(title));
    const category =
        input.assetCategory ??
        (input.category ? assetCategoryForContent(input.category) : "hospitality");

    return {
        category,
        concepts: hinted?.concepts ?? CONCEPT_BANK[category],
    };
}

export function primaryVisualConcept(input: {
    title?: string;
    category?: ContentCategory;
    keywords?: string[];
}): string {
    return visualConceptsFor(input).concepts[0];
}
