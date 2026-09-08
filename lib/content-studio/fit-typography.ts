import { artDirectedHeadline, headlineCharRatio } from "@/lib/content-studio/headline";
import { getLayout, type LayoutZone, type StackPart } from "@/lib/content-studio/layouts";
import type {
    EditorialDocument,
    StudioRect,
    StudioTypography,
} from "@/lib/content-studio/types";

export function estimateLineCount(
    text: string,
    fontSize: number,
    width: number,
    uppercase = false,
): number {
    const source = text.replace(/\n/g, " ").trim();
    if (!source) return 0;
    const hardBreaks = text.split("\n").filter((line) => line.trim().length > 0);
    if (hardBreaks.length > 1) {
        return hardBreaks.reduce(
            (sum, line) =>
                sum + estimateLineCount(line, fontSize, width, uppercase),
            0,
        );
    }
    const avg = fontSize * headlineCharRatio(uppercase);
    const charsPerLine = Math.max(6, Math.floor(width / avg));
    return Math.max(1, Math.ceil(source.length / charsPerLine));
}

export function fitTitleSize(
    title: string,
    zone: StudioRect,
    typography: StudioTypography,
    uppercase = false,
): number {
    const base = typography.titleSize;
    const lines = Math.max(
        1,
        estimateLineCount(title, base, zone.w, uppercase),
    );
    const needed = lines * base * typography.titleLineHeight;
    if (needed <= zone.h) {
        if (lines <= 2 && title.replace(/\n/g, "").length < 18 && zone.h > base * 3.4) {
            return Math.min(Math.round(base * 1.12), Math.round(zone.h * 0.38));
        }
        return base;
    }
    const scaled = Math.floor(base * (zone.h / needed));
    return Math.max(Math.round(base * 0.82), scaled);
}

export function fittedTypography(
    document: EditorialDocument,
): StudioTypography {
    const layout = getLayout(document.layoutId);
    const titleZone =
        layout.zones.find((zone) => zone.type === "text-stack")?.rect ??
        layout.zones.find((zone) => zone.type === "title")?.rect;
    if (!titleZone) return document.typography;

    const directed = artDirectedHeadline(
        document.content.title,
        document.layoutId,
        layout.headlineCase,
    );
    const titleSize = fitTitleSize(
        directed.text,
        {
            ...titleZone,
            h: layout.headlineSize === "display" ? titleZone.h * 0.72 : titleZone.h * 0.55,
        },
        document.typography,
        directed.uppercase,
    );

    return { ...document.typography, titleSize };
}

export type StackItem =
    | {
          type: "kicker" | "subtitle" | "body" | "cta";
          text: string;
          x: number;
          y: number;
          w: number;
          h: number;
      }
    | {
          type: "title";
          text: string;
          x: number;
          y: number;
          w: number;
          h: number;
          fontSize: number;
          uppercase: boolean;
      }
    | { type: "rule"; x: number; y: number; w: number; h: number }
    | { type: "mark"; x: number; y: number; w: number; h: number };

function originX(zone: LayoutZone, width: number, itemWidth: number): number {
    if (zone.align === "center") return zone.rect.x + (width - itemWidth) / 2;
    if (zone.align === "right") return zone.rect.x + width - itemWidth;
    return zone.rect.x;
}

export function composeTextStack(
    document: EditorialDocument,
    zone: LayoutZone,
): StackItem[] {
    const layout = getLayout(document.layoutId);
    const include: StackPart[] =
        zone.include ?? ["kicker", "title", "rule", "body", "cta"];
    const typography = document.typography;
    const directed = artDirectedHeadline(
        document.content.title,
        document.layoutId,
        layout.headlineCase,
    );
    const items: StackItem[] = [];
    let cursor = zone.rect.y;
    const width = zone.rect.w;
    const align = zone.align ?? "left";
    const isDisplay = layout.headlineSize === "display";

    const pushGap = (gap: number) => {
        cursor += gap;
    };

    for (const part of include) {
        if (cursor > zone.rect.y + zone.rect.h - 8) break;

        if (part === "kicker" && document.content.kicker.trim()) {
            const h = typography.kickerSize * 1.35;
            items.push({
                type: "kicker",
                text: document.content.kicker,
                x: zone.rect.x,
                y: cursor,
                w: width,
                h,
            });
            pushGap(h + (isDisplay ? 28 : 18));
            continue;
        }

        if (part === "title" && directed.text) {
            const remaining = zone.rect.y + zone.rect.h - cursor;
            const fontSize = fitTitleSize(
                directed.text,
                { x: zone.rect.x, y: cursor, w: width, h: Math.max(80, remaining * 0.78) },
                typography,
                directed.uppercase,
            );
            const lines = Math.max(
                1,
                estimateLineCount(directed.text, fontSize, width, directed.uppercase),
            );
            const h = lines * fontSize * typography.titleLineHeight;
            items.push({
                type: "title",
                text: directed.text,
                x: zone.rect.x,
                y: cursor,
                w: width,
                h,
                fontSize,
                uppercase: directed.uppercase,
            });
            pushGap(h + (isDisplay ? 36 : 26));
            continue;
        }

        if (part === "rule") {
            const ruleW = align === "center" ? 72 : isDisplay ? 64 : 88;
            items.push({
                type: "rule",
                x: originX(zone, width, ruleW),
                y: cursor,
                w: ruleW,
                h: 2,
            });
            pushGap(28);
            continue;
        }

        if (part === "subtitle" && document.content.subtitle.trim()) {
            const h = typography.bodySize * 1.45 * 2;
            items.push({
                type: "subtitle",
                text: document.content.subtitle,
                x: zone.rect.x,
                y: cursor,
                w: width,
                h,
            });
            pushGap(h * 0.7 + 16);
            continue;
        }

        if (part === "body" && document.content.body.trim()) {
            const lines = Math.min(
                5,
                estimateLineCount(document.content.body, typography.bodySize, width),
            );
            const h = Math.max(typography.bodySize * 1.5, lines * typography.bodySize * 1.42);
            items.push({
                type: "body",
                text: document.content.body,
                x: zone.rect.x,
                y: cursor,
                w: width,
                h,
            });
            pushGap(h + 32);
            continue;
        }

        if (part === "cta" && layout.showCta && document.content.cta.trim()) {
            const h = typography.ctaSize * 1.6;
            items.push({
                type: "cta",
                text: document.content.cta,
                x: zone.rect.x,
                y: cursor,
                w: width,
                h,
            });
            pushGap(h + 12);
            continue;
        }

        if (part === "mark") {
            items.push({
                type: "mark",
                x: originX(zone, width, 10),
                y: cursor + 6,
                w: 10,
                h: 10,
            });
            pushGap(24);
        }
    }

    return items;
}

export function assetCoverage(document: EditorialDocument): number {
    const w = document.asset.width * document.asset.scale;
    const h = document.asset.height * document.asset.scale;
    return (w * h) / (1080 * 1350);
}
