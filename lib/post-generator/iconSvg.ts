/**
 * SVG markup for amenity / contact icons — same Lucide + WhatsApp shapes
 * used in the live preview, so canvas export matches what you see.
 */

import type { AmenityIconKey, ContactIconKey } from "@/lib/post-generator/types";

type SvgNode = [tag: string, attrs: Record<string, string | number>];

/** Lucide icon trees (viewBox 0 0 24 24, stroke icons). */
const AMENITY_NODES: Record<Exclude<AmenityIconKey, "custom">, SvgNode[]> = {
    wifi: [
        ["path", { d: "M12 20h.01" }],
        ["path", { d: "M2 8.82a15 15 0 0 1 20 0" }],
        ["path", { d: "M5 12.859a10 10 0 0 1 14 0" }],
        ["path", { d: "M8.5 16.429a5 5 0 0 1 7 0" }],
    ],
    zap: [
        [
            "path",
            {
                d: "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
            },
        ],
    ],
    pool: [
        [
            "path",
            {
                d: "M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
            },
        ],
        [
            "path",
            {
                d: "M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
            },
        ],
        [
            "path",
            {
                d: "M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1",
            },
        ],
    ],
    kitchen: [
        ["path", { d: "M2 12h20" }],
        ["path", { d: "M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" }],
        ["path", { d: "m4 8 16-4" }],
        [
            "path",
            {
                d: "m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8",
            },
        ],
    ],
    gamepad: [
        ["line", { x1: "6", x2: "10", y1: "11", y2: "11" }],
        ["line", { x1: "8", x2: "8", y1: "9", y2: "13" }],
        ["line", { x1: "15", x2: "15.01", y1: "12", y2: "12" }],
        ["line", { x1: "18", x2: "18.01", y1: "10", y2: "10" }],
        [
            "path",
            {
                d: "M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z",
            },
        ],
    ],
    dumbbell: [
        [
            "path",
            {
                d: "M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z",
            },
        ],
        ["path", { d: "m2.5 21.5 1.4-1.4" }],
        ["path", { d: "m20.1 3.9 1.4-1.4" }],
        [
            "path",
            {
                d: "M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z",
            },
        ],
        ["path", { d: "m9.6 14.4 4.8-4.8" }],
    ],
    cleaning: [
        ["path", { d: "M3 3h.01" }],
        ["path", { d: "M7 5h.01" }],
        ["path", { d: "M11 7h.01" }],
        ["path", { d: "M3 7h.01" }],
        ["path", { d: "M7 9h.01" }],
        ["path", { d: "M3 11h.01" }],
        ["rect", { width: "4", height: "4", x: "15", y: "5" }],
        ["path", { d: "m19 9 2 2v10c0 .6-.4 1-1 1h-6c-.6 0-1-.4-1-1V11l2-2" }],
        ["path", { d: "m13 14 8-2" }],
        ["path", { d: "m13 19 8-2" }],
    ],
    washer: [
        ["path", { d: "M3 6h3" }],
        ["path", { d: "M17 6h.01" }],
        ["rect", { width: "18", height: "20", x: "3", y: "2", rx: "2" }],
        ["circle", { cx: "12", cy: "13", r: "5" }],
        ["path", { d: "M12 18a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 1 0-5" }],
    ],
    tv: [
        ["path", { d: "m17 2-5 5-5-5" }],
        ["rect", { width: "20", height: "15", x: "2", y: "7", rx: "2" }],
    ],
    ac: [
        ["path", { d: "M18 17.5a2.5 2.5 0 1 1-4 2.03V12" }],
        [
            "path",
            {
                d: "M6 12H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
            },
        ],
        ["path", { d: "M6 8h12" }],
        ["path", { d: "M6.6 15.572A2 2 0 1 0 10 17v-5" }],
    ],
    bed: [
        ["path", { d: "M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" }],
        ["path", { d: "M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" }],
        ["path", { d: "M12 4v6" }],
        ["path", { d: "M2 18h20" }],
    ],
    shield: [
        [
            "path",
            {
                d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z",
            },
        ],
        ["path", { d: "m9 12 2 2 4-4" }],
    ],
    sparkles: [
        [
            "path",
            {
                d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
            },
        ],
        ["path", { d: "M20 2v4" }],
        ["path", { d: "M22 4h-4" }],
        ["circle", { cx: "4", cy: "20", r: "2" }],
    ],
};

const CONTACT_STROKE_NODES: Record<Exclude<ContactIconKey, "whatsapp">, SvgNode[]> = {
    instagram: [
        ["rect", { width: "20", height: "20", x: "2", y: "2", rx: "5", ry: "5" }],
        ["path", { d: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" }],
        ["line", { x1: "17.5", x2: "17.51", y1: "6.5", y2: "6.5" }],
    ],
    website: [
        ["circle", { cx: "12", cy: "12", r: "10" }],
        ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" }],
        ["path", { d: "M2 12h20" }],
    ],
    email: [
        ["path", { d: "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" }],
        ["rect", { x: "2", y: "4", width: "20", height: "16", rx: "2" }],
    ],
    phone: [
        [
            "path",
            {
                d: "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
            },
        ],
    ],
};

/** Font Awesome WhatsApp mark (filled), viewBox 0 0 448 512 */
const WHATSAPP_PATH =
    "M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z";

function escapeAttr(value: string | number): string {
    return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function nodesToMarkup(nodes: SvgNode[]): string {
    return nodes
        .map(([tag, attrs]) => {
            const attrStr = Object.entries(attrs)
                .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
                .join(" ");
            return `<${tag} ${attrStr} />`;
        })
        .join("");
}

function strokeSvg(
    inner: string,
    size: number,
    color: string,
    strokeWidth: number,
): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${escapeAttr(color)}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}

export function amenityIconSvg(
    icon: AmenityIconKey,
    size: number,
    color: string,
    strokeWidth: number,
    customSvg?: string | null,
): string {
    if (icon === "custom" && customSvg?.trim()) {
        // Assume caller provided a full <svg> or inner markup; wrap if needed.
        const trimmed = customSvg.trim();
        if (trimmed.startsWith("<svg")) return trimmed;
        return strokeSvg(trimmed, size, color, strokeWidth);
    }
    const key = icon === "custom" ? "sparkles" : icon;
    const nodes = AMENITY_NODES[key] ?? AMENITY_NODES.sparkles;
    return strokeSvg(nodesToMarkup(nodes), size, color, strokeWidth);
}

export function contactIconSvg(
    type: ContactIconKey,
    size: number,
    color: string,
    strokeWidth: number,
): string {
    if (type === "whatsapp") {
        return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 448 512" fill="${escapeAttr(color)}"><path d="${WHATSAPP_PATH}" /></svg>`;
    }
    const nodes = CONTACT_STROKE_NODES[type] ?? CONTACT_STROKE_NODES.website;
    return strokeSvg(nodesToMarkup(nodes), size, color, strokeWidth);
}

export function loadSvgAsImage(svgMarkup: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to rasterize icon SVG"));
        img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
    });
}
