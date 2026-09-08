import type { LayoutId } from "@/lib/content-studio/types";

const GREETING_STACKS: Array<{ pattern: RegExp; text: string }> = [
    { pattern: /^happy\s+new\s+week!?$/i, text: "Happy\nNew Week" },
    { pattern: /^happy\s+new\s+month!?$/i, text: "Happy\nNew Month" },
    { pattern: /^welcome\s+the\s+month!?$/i, text: "Welcome\nthe Month" },
    { pattern: /^a\s+new\s+week!?$/i, text: "A New\nWeek" },
];

export function artDirectedHeadline(
    title: string,
    layoutId: LayoutId,
    headlineCase: "preserve" | "display-stack",
): { text: string; uppercase: boolean } {
    const trimmed = title.replace(/\s+/g, " ").trim();
    if (!trimmed) return { text: "", uppercase: false };

    if (headlineCase === "display-stack") {
        const greeting = GREETING_STACKS.find((entry) => entry.pattern.test(trimmed));
        if (greeting) return { text: greeting.text, uppercase: true };

        const words = trimmed.split(" ");
        if (words.length === 2) {
            return { text: `${words[0]}\n${words[1]}`, uppercase: true };
        }
        if (words.length === 3) {
            return { text: `${words[0]}\n${words.slice(1).join(" ")}`, uppercase: true };
        }
        if (words.length === 4) {
            return {
                text: `${words.slice(0, 2).join(" ")}\n${words.slice(2).join(" ")}`,
                uppercase: layoutId === "minimal-luxury",
            };
        }
    }

    return { text: trimmed, uppercase: false };
}

export function headlineCharRatio(uppercase: boolean): number {
    return uppercase ? 0.58 : 0.5;
}
