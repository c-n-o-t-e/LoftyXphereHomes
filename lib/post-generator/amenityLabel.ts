/**
 * Split amenity labels into stacked lines (reference flyer readability).
 * Examples:
 * - "Starlink Internet" → ["STARLINK", "INTERNET"]
 * - "24/7 Power" → ["24/7", "POWER"]
 * - "Fully Equipped Kitchen" → ["FULLY EQUIPPED", "KITCHEN"]
 * - "Smart TV & PS5" → ["SMART TV", "& PS5"]
 * - "Gym & Fitness" → ["GYM &", "FITNESS"]
 */
export function splitAmenityLabelLines(label: string): string[] {
    const words = label
        .trim()
        .toUpperCase()
        .split(/\s+/)
        .filter(Boolean);
    if (words.length === 0) return [""];
    if (words.length === 1) return [words[0]!];
    if (words.length === 2) return [words[0]!, words[1]!];
    return [words.slice(0, 2).join(" "), words.slice(2).join(" ")];
}
