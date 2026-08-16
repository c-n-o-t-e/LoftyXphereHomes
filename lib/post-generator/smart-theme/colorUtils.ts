/** Isolated color helpers for the Smart Theme Engine (no marketing deps). */

export function clamp(n: number, min = 0, max = 1): number {
    return Math.min(max, Math.max(min, n));
}

export function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
    const n = Number.parseInt(full, 16);
    if (Number.isNaN(n)) return [0, 0, 0];
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b]
        .map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0"))
        .join("")}`;
}

export function relativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function luminanceHex(hex: string): number {
    const [r, g, b] = hexToRgb(hex);
    return relativeLuminance(r, g, b);
}

export function contrastRatio(a: string, b: string): number {
    const l1 = luminanceHex(a);
    const l2 = luminanceHex(b);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

export function meetsAaContrast(fg: string, bg: string, largeText = false): boolean {
    return contrastRatio(fg, bg) >= (largeText ? 3 : 4.5);
}

/** Pick black or white text for maximum contrast on bg. */
export function bestTextOn(bg: string): string {
    return contrastRatio("#2C2C2C", bg) >= contrastRatio("#FFFFFF", bg)
        ? "#2C2C2C"
        : "#FFFFFF";
}

/** Ensure fg meets AA on bg by darkening/lightening toward black/white. */
export function ensureAaText(fg: string, bg: string, largeText = false): string {
    if (meetsAaContrast(fg, bg, largeText)) return fg;
    const dark = "#1A1A1A";
    const light = "#FFFFFF";
    const preferDark = contrastRatio(dark, bg) >= contrastRatio(light, bg);
    let [r, g, b] = hexToRgb(fg);
    const target = preferDark ? dark : light;
    const [tr, tg, tb] = hexToRgb(target);
    for (let i = 0; i < 12; i++) {
        r = r + (tr - r) * 0.28;
        g = g + (tg - g) * 0.28;
        b = b + (tb - b) * 0.28;
        const hex = rgbToHex(r, g, b);
        if (meetsAaContrast(hex, bg, largeText)) return hex;
    }
    return preferDark ? dark : light;
}

export function mixHex(a: string, b: string, t: number): string {
    const [ar, ag, ab] = hexToRgb(a);
    const [br, bg, bb] = hexToRgb(b);
    const u = clamp(t);
    return rgbToHex(ar + (br - ar) * u, ag + (bg - ag) * u, ab + (bb - ab) * u);
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
        else if (max === gn) h = ((bn - rn) / d + 2) / 6;
        else h = ((rn - gn) / d + 4) / 6;
    }
    const s = max === 0 ? 0 : d / max;
    return [h, s, max];
}

export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    const mod = i % 6;
    const map: [number, number, number][] = [
        [v, t, p],
        [q, v, p],
        [p, v, t],
        [p, q, v],
        [t, p, v],
        [v, p, q],
    ];
    const [r, g, b] = map[mod] ?? [v, v, v];
    return [r * 255, g * 255, b * 255];
}

export function rgba(hex: string, alpha: number): string {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${clamp(alpha)})`;
}

/** Soft champagne-gold from a warm accent sample. */
export function toChampagneGold(sample: string): string {
    const [r, g, b] = hexToRgb(sample);
    const [, s, v] = rgbToHsv(r, g, b);
    // Lock hue near champagne (~38°)
    const goldH = 38 / 360;
    const [nr, ng, nb] = hsvToRgb(goldH, clamp(s * 0.55 + 0.28, 0.32, 0.55), clamp(v * 0.35 + 0.55, 0.55, 0.78));
    return rgbToHex(nr, ng, nb);
}

export function softIvoryFrom(warmth: number, brightness: number): string {
    // Base ivory #F8F4EC with warmth/brightness nudges
    const base = warmth > 0.15 ? [248, 242, 228] : warmth < -0.1 ? [244, 245, 248] : [248, 244, 236];
    const lift = (brightness - 0.5) * 10;
    return rgbToHex(base[0]! + lift, base[1]! + lift * 0.9, base[2]! + lift * 0.7);
}

/**
 * Soft surface colour that keeps the photo's hue (Imaginative theme).
 * Light = pastel panel; dark = tinted charcoal.
 */
export function liftToSurface(sample: string, mode: "light" | "dark"): string {
    const [r, g, b] = hexToRgb(sample);
    const [h, s, v] = rgbToHsv(r, g, b);
    if (mode === "light") {
        const [nr, ng, nb] = hsvToRgb(
            h,
            clamp(s * 0.28, 0.04, 0.24),
            clamp(0.88 + v * 0.08, 0.87, 0.96),
        );
        return rgbToHex(nr, ng, nb);
    }
    const [nr, ng, nb] = hsvToRgb(
        h,
        clamp(s * 0.4, 0.08, 0.38),
        clamp(0.12 + v * 0.1, 0.12, 0.24),
    );
    return rgbToHex(nr, ng, nb);
}

/** Keep photo accent hue, polish for CTA / gold-slot contrast. */
export function polishAccent(sample: string): string {
    const [r, g, b] = hexToRgb(sample);
    const [h, s, v] = rgbToHsv(r, g, b);
    const [nr, ng, nb] = hsvToRgb(
        h,
        clamp(s * 0.65 + 0.22, 0.32, 0.72),
        clamp(v * 0.35 + 0.48, 0.42, 0.78),
    );
    return rgbToHex(nr, ng, nb);
}
