import type { StudioIconKey } from "@/lib/content-studio/types";

type SvgNode = [tag: string, attrs: Record<string, string | number>];

/** Single stroke language — 24 viewBox, 1.6 weight. Never mix emoji or clip-art. */
const ICON_NODES: Record<StudioIconKey, SvgNode[]> = {
    "map-pin": [
        ["path", { d: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" }],
        ["circle", { cx: "12", cy: "10", r: "3" }],
    ],
    shield: [
        [
            "path",
            {
                d: "M20 13c0 5-3.5 7.5-8 10-4.5-2.5-8-5-8-10V6l8-3 8 3Z",
            },
        ],
    ],
    zap: [["path", { d: "M13 2 4 14h7l-1 8 9-12h-7l1-8z" }]],
    wifi: [
        ["path", { d: "M12 20h.01" }],
        ["path", { d: "M2 8.82a15 15 0 0 1 20 0" }],
        ["path", { d: "M5 12.86a10 10 0 0 1 14 0" }],
        ["path", { d: "M8.5 16.43a5 5 0 0 1 7 0" }],
    ],
    sparkles: [
        [
            "path",
            {
                d: "M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1",
            },
        ],
        ["circle", { cx: "12", cy: "12", r: "3.2" }],
    ],
    key: [
        ["circle", { cx: "8", cy: "15", r: "4" }],
        ["path", { d: "M12 15h9l-2 2 2 2" }],
    ],
    suitcase: [
        ["rect", { x: "4", y: "8", width: "16", height: "12", rx: "1.5" }],
        ["path", { d: "M9 8V6a3 3 0 0 1 6 0v2" }],
    ],
    coffee: [
        ["path", { d: "M17 8h1a4 4 0 0 1 0 8h-1" }],
        ["path", { d: "M3 8h14v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" }],
        ["path", { d: "M6 2v2M10 2v2M14 2v2" }],
    ],
    sun: [
        ["circle", { cx: "12", cy: "12", r: "4" }],
        [
            "path",
            {
                d: "M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
            },
        ],
    ],
    moon: [["path", { d: "M21 14.5A8.5 8.5 0 1 1 9.5 3 7 7 0 0 0 21 14.5Z" }]],
    leaf: [
        [
            "path",
            {
                d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.5 2 8a8 8 0 0 1-8 8 8 8 0 0 1-2 2Z",
            },
        ],
        ["path", { d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" }],
    ],
    building: [
        ["rect", { x: "4", y: "3", width: "16", height: "18", rx: "1" }],
        ["path", { d: "M9 21v-6h6v6M8 7h.01M12 7h.01M16 7h.01M8 11h.01M12 11h.01M16 11h.01" }],
    ],
    plane: [
        [
            "path",
            {
                d: "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2Z",
            },
        ],
    ],
    book: [
        ["path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }],
        ["path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" }],
    ],
    heart: [
        [
            "path",
            {
                d: "M19 14c1.5-1.4 3-3.1 3-5.4A5.4 5.4 0 0 0 16.6 3c-1.6 0-3.1.7-4.1 1.9A5.6 5.6 0 0 0 8.4 3 5.4 5.4 0 0 0 3 8.6c0 2.3 1.5 4 3 5.4l6 5.8Z",
            },
        ],
    ],
    clock: [
        ["circle", { cx: "12", cy: "12", r: "9" }],
        ["path", { d: "M12 7v5l3 2" }],
    ],
    star: [
        [
            "path",
            {
                d: "M12 3.2 14.4 8l5.4.8-3.9 3.8.9 5.4L12 15.5 7.2 18l.9-5.4L4.2 8.8 9.6 8Z",
            },
        ],
    ],
    globe: [
        ["circle", { cx: "12", cy: "12", r: "9" }],
        ["path", { d: "M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" }],
    ],
};

export const STUDIO_ICON_KEYS = Object.keys(ICON_NODES) as StudioIconKey[];

export function studioIconSvg(
    key: StudioIconKey,
    color: string,
    size = 24,
    strokeWidth = 1.6,
): string {
    const nodes = ICON_NODES[key] ?? ICON_NODES.sparkles;
    const inner = nodes
        .map(([tag, attrs]) => {
            const attr = Object.entries(attrs)
                .map(([name, value]) => `${name}="${value}"`)
                .join(" ");
            return `<${tag} ${attr}/>`;
        })
        .join("");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

export function loadSvgAsImage(svg: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const blob = new Blob([svg], { type: "image/svg+xml" });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Failed to load icon"));
        };
        img.src = url;
    });
}
