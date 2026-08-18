import { assetCategoryForContent } from "@/lib/content-studio/smart-layout-advisor";
import type { AssetCategory, ContentCategory } from "@/lib/content-studio/types";

const CONCEPT_BANK: Record<AssetCategory, [string, string, string]> = {
    travel: [
        "A refined leather suitcase standing slightly open, champagne hardware, isolated on a transparent background",
        "A navy passport, boarding wallet and gold luggage tag arranged as a still life, no text, transparent background",
        "A pair of tortoiseshell sunglasses resting on folded linen, warm studio light, isolated object",
    ],
    hospitality: [
        "A brass hotel room key on a cream leather fob, soft champagne highlights, isolated, no text",
        "A ceramic cup of black coffee on a linen napkin, steam barely visible, luxury hospitality still life",
        "A folded ivory towel with a single sprig of greenery, warm studio lighting, transparent background",
    ],
    lifestyle: [
        "An open notebook with a gold pen on warm stone, no writing visible, editorial still life",
        "A slim laptop closed beside a ceramic cup, cream environment, isolated objects",
        "Over-ear headphones in cognac leather, soft shadow, transparent background",
    ],
    food: [
        "A breakfast plate of fruit and pastry on stoneware, warm ivory light, no logos, isolated",
        "A single ripe fig cut open on a ceramic plate, editorial food photography, transparent background",
        "A restaurant table setting for one — linen, glass, gold cutlery — isolated composition",
    ],
    abuja: [
        "An elegant architectural fragment suggesting Abuja skyline at dusk, no text, editorial realism",
        "A modern city balcony view with warm evening light, isolated photographic subject",
        "A refined local craft object on stone, suggesting place without cliché landmarks",
    ],
    business: [
        "A leather laptop sleeve and fountain pen on warm oak, isolated, no text",
        "A closed notebook, reading glasses and room key card, hospitality-business still life",
        "A slim briefcase in cognac leather, champagne hardware, transparent background",
    ],
    wellness: [
        "A linen robe folded with a small bottle of oil, spa still life, warm cream light",
        "A ceramic water carafe and glass on stone, quiet luxury, isolated",
        "Rolled yoga mat in sand linen with a single leaf, transparent background",
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
        "A luxury hotel key, leather travel wallet and booking folder, no readable text",
        "A brass room key beside a small plant on stone, warm cream environment",
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
        pattern: /\bcoffee|morning|breakfast\b/i,
        concepts: CONCEPT_BANK.food,
    },
    {
        pattern: /\babuja|wuye|city|places\b/i,
        concepts: CONCEPT_BANK.abuja,
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
