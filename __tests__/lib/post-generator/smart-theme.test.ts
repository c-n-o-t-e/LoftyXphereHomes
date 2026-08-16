import { analyzePixelBuffer } from "@/lib/post-generator/smart-theme/imageAnalyzer";
import {
    generateThemes,
    nextImaginativeExpression,
    pickRecommendedIndex,
    buildRecommendations,
} from "@/lib/post-generator/smart-theme/themeGenerator";
import { suggestCardOffsetY } from "@/lib/post-generator/smart-theme/layoutGenerator";
import { themeTokensToPatch } from "@/lib/post-generator/smart-theme/applyTheme";
import {
    contrastRatio,
    meetsAaContrast,
    ensureAaText,
    luminanceHex,
} from "@/lib/post-generator/smart-theme/colorUtils";
import { createDefaultPostDocument } from "@/lib/post-generator/defaults";
import {
    clearSmartThemeCache,
    getCachedSmartTheme,
    imageCacheKey,
    setCachedSmartTheme,
} from "@/lib/post-generator/smart-theme/cache";
import type { SmartThemeResult } from "@/lib/post-generator/smart-theme/types";

function makeBuffer(
    width: number,
    height: number,
    fill: (x: number, y: number) => [number, number, number],
) {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const [r, g, b] = fill(x, y);
            const i = (y * width + x) * 4;
            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
            data[i + 3] = 255;
        }
    }
    return { width, height, data };
}

describe("smart-theme colorUtils", () => {
    it("meets AA for dark text on ivory", () => {
        expect(meetsAaContrast("#2C2C2C", "#F8F4EC")).toBe(true);
        expect(contrastRatio("#2C2C2C", "#F8F4EC")).toBeGreaterThanOrEqual(4.5);
    });

    it("ensureAaText lifts weak contrast", () => {
        const fixed = ensureAaText("#C8A66A", "#F8F4EC");
        expect(meetsAaContrast(fixed, "#F8F4EC", true)).toBe(true);
    });
});

describe("smart-theme imageAnalyzer", () => {
    it("detects warm bright interiors", () => {
        const buf = makeBuffer(48, 60, () => [220, 180, 120]);
        const analysis = analyzePixelBuffer(buf);
        expect(analysis.brightness).toBeGreaterThan(0.4);
        expect(analysis.warmth).toBeGreaterThan(0.1);
        expect(analysis.dominantColors.length).toBeGreaterThan(0);
    });

    it("detects dark moody scenes", () => {
        const buf = makeBuffer(48, 60, () => [24, 22, 28]);
        const analysis = analyzePixelBuffer(buf);
        expect(analysis.brightness).toBeLessThan(0.2);
        expect(analysis.shadowRatio).toBeGreaterThan(0.5);
    });

    it("scores busy scenes higher than flat fields", () => {
        const quiet = makeBuffer(48, 60, () => [200, 190, 170]);
        const busy = makeBuffer(48, 60, (x) => {
            // Wide vertical stripes → strong Sobel edges
            const v = Math.floor(x / 4) % 2 === 0 ? 30 : 230;
            return [v, v * 0.92, v * 0.75];
        });
        const aQuiet = analyzePixelBuffer(quiet);
        const aBusy = analyzePixelBuffer(busy);
        expect(aBusy.edgeDensity).toBeGreaterThan(aQuiet.edgeDensity);
        expect(aBusy.complexity).toBeGreaterThan(aQuiet.complexity);
        expect(aBusy.contrast).toBeGreaterThan(aQuiet.contrast);
    });
});

describe("smart-theme theme + layout generators", () => {
    it("generates four themes including Imaginative", () => {
        const analysis = analyzePixelBuffer(
            makeBuffer(32, 40, () => [210, 170, 110]),
        );
        const themes = generateThemes(analysis);
        expect(themes).toHaveLength(4);
        expect(themes.map((t) => t.id)).toEqual([
            "luxury-warm",
            "editorial-ivory",
            "dark-boutique",
            "imaginative",
        ]);
        const imaginative = themes.find((t) => t.id === "imaginative");
        expect(imaginative?.gold).toBeTruthy();
        expect(imaginative?.background).toBeTruthy();
        expect(imaginative?.expression).toBe(0);
        expect(imaginative?.label).toMatch(/Soft/i);

        const idx = pickRecommendedIndex(analysis, themes);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(themes[idx]?.label).toBeTruthy();
        const recs = buildRecommendations(analysis, themes[idx]!);
        expect(recs.length).toBeGreaterThan(2);
    });

    it("toggles Imaginative Soft ↔ Bold while other themes stay stable", () => {
        const analysis = analyzePixelBuffer(
            makeBuffer(32, 40, () => [180, 140, 100]),
        );
        const softSet = generateThemes(analysis, { imaginativeExpression: 0 });
        const boldSet = generateThemes(analysis, { imaginativeExpression: 1 });

        // First three themes identical across expressions
        for (let i = 0; i < 3; i++) {
            expect(softSet[i]?.background).toBe(boldSet[i]?.background);
            expect(softSet[i]?.gold).toBe(boldSet[i]?.gold);
            expect(softSet[i]?.cardOffsetY).toBe(boldSet[i]?.cardOffsetY);
        }

        const soft = softSet.find((t) => t.id === "imaginative")!;
        const bold = boldSet.find((t) => t.id === "imaginative")!;
        expect(soft.expression).toBe(0);
        expect(bold.expression).toBe(1);
        expect(soft.label).toMatch(/Soft/i);
        expect(bold.label).toMatch(/Bold/i);
        // Different shade and/or layout so re-analyze feels like a new option
        const differs =
            soft.background !== bold.background ||
            soft.gold !== bold.gold ||
            soft.cardOffsetY !== bold.cardOffsetY ||
            soft.glassOpacity !== bold.glassOpacity;
        expect(differs).toBe(true);
        expect(nextImaginativeExpression(0)).toBe(1);
        expect(nextImaginativeExpression(1)).toBe(0);
    });

    it("recommends Imaginative for vivid / unique colour photos", () => {
        // Bright saturated teal — vivid, not moody
        const analysis = analyzePixelBuffer(
            makeBuffer(32, 40, () => [70, 200, 210]),
        );
        expect(analysis.brightness).toBeGreaterThan(0.35);
        expect(analysis.saturation).toBeGreaterThan(0.25);
        const themes = generateThemes(analysis);
        const idx = pickRecommendedIndex(analysis, themes);
        expect(themes[idx]?.id).toBe("imaginative");
        const recs = buildRecommendations(analysis, themes[idx]!);
        expect(recs.some((r) => r.id === "native" || r.id === "accent")).toBe(true);
    });

    it("raises card when lower band is busy", () => {
        const quiet = analyzePixelBuffer(makeBuffer(32, 40, () => [200, 195, 180]));
        const busyLower = analyzePixelBuffer(
            makeBuffer(32, 40, (x, y) => {
                if (y > 24) {
                    const v = (x + y) % 3 === 0 ? 30 : 230;
                    return [v, v, v];
                }
                return [200, 195, 180];
            }),
        );
        const quietOffset = suggestCardOffsetY(quiet);
        const busyOffset = suggestCardOffsetY(busyLower);
        expect(busyOffset).toBeLessThanOrEqual(quietOffset);
    });

    it("applies theme patch without wiping amenities", () => {
        const doc = createDefaultPostDocument();
        const analysis = analyzePixelBuffer(
            makeBuffer(24, 30, () => [180, 140, 90]),
        );
        const themes = generateThemes(analysis);
        const patch = themeTokensToPatch(themes[0]!, doc);
        expect(patch.theme?.gold).toBeTruthy();
        expect(patch.overlay?.opacity).toBeGreaterThan(0);
        expect(patch.overlay?.cardOffsetY).toBeDefined();
        // Patch is partial — amenities not included
        expect(patch.amenities).toBeUndefined();
    });

    it("uses light logo on dark Imaginative panels", () => {
        const doc = createDefaultPostDocument();
        const analysis = analyzePixelBuffer(
            makeBuffer(24, 30, () => [20, 18, 22]),
        );
        const themes = generateThemes(analysis);
        const imaginative = themes.find((t) => t.id === "imaginative")!;
        const patch = themeTokensToPatch(imaginative, doc);
        // Dark analysis → imaginative darkUi → light logo
        if (luminanceHex(imaginative.background) < 0.35) {
            expect(patch.logo?.variant).toBe("light");
        }
    });
});

describe("smart-theme cache", () => {
    afterEach(() => clearSmartThemeCache());

    it("caches by image key and skips recompute", () => {
        const key = imageCacheKey("https://example.com/a.jpg");
        const fake = {
            imageKey: key,
            analyzedAt: 1,
            analysis: analyzePixelBuffer(makeBuffer(8, 8, () => [100, 80, 60])),
            themes: generateThemes(
                analyzePixelBuffer(makeBuffer(8, 8, () => [100, 80, 60])),
            ),
            recommendedIndex: 0,
            recommendations: [],
            imaginativeExpression: 0,
        } satisfies SmartThemeResult;
        setCachedSmartTheme(fake);
        expect(getCachedSmartTheme(key)?.analyzedAt).toBe(1);
    });
});
