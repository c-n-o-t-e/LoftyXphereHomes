import {
    clamp,
    relativeLuminance,
    rgbToHex,
    rgbToHsv,
} from "@/lib/post-generator/smart-theme/colorUtils";
import type { ImageAnalysis, RegionScore } from "@/lib/post-generator/smart-theme/types";

const ANALYZE_W = 96;
const ANALYZE_H = 120;
const GRID_COLS = 6;
const GRID_ROWS = 8;

export type PixelBuffer = {
    width: number;
    height: number;
    /** RGBA length = width * height * 4 */
    data: Uint8ClampedArray | Uint8Array;
};

/** Pure analysis from pixel buffer (testable without DOM). */
export function analyzePixelBuffer(buf: PixelBuffer): ImageAnalysis {
    const { width, height, data } = buf;
    const n = width * height;
    if (n === 0) {
        return emptyAnalysis(width, height);
    }

    let sumL = 0;
    let sumL2 = 0;
    let sumS = 0;
    let sumWarm = 0;
    let sumWb = 0;
    let shadows = 0;
    let highlights = 0;

    // Quantized color histogram (4 bits/channel → 4096 buckets, we keep top)
    const buckets = new Map<number, { count: number; r: number; g: number; b: number }>();

    for (let i = 0; i < n; i++) {
        const o = i * 4;
        const r = data[o] ?? 0;
        const g = data[o + 1] ?? 0;
        const b = data[o + 2] ?? 0;
        const l = relativeLuminance(r, g, b);
        sumL += l;
        sumL2 += l * l;
        const [, s] = rgbToHsv(r, g, b);
        sumS += s;
        sumWarm += (r - b) / 255;
        sumWb += (g - (r + b) / 2) / 255;
        if (l < 0.12) shadows += 1;
        if (l > 0.88) highlights += 1;

        const key =
            ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
        const existing = buckets.get(key);
        if (existing) {
            existing.count += 1;
            existing.r += r;
            existing.g += g;
            existing.b += b;
        } else {
            buckets.set(key, { count: 1, r, g, b });
        }
    }

    const meanL = sumL / n;
    const variance = Math.max(0, sumL2 / n - meanL * meanL);
    const contrast = clamp(Math.sqrt(variance) * 2.2);
    const saturation = clamp(sumS / n);
    const warmth = clamp(sumWarm / n, -1, 1);
    const whiteBalance = clamp(sumWb / n, -1, 1);

    const ranked = [...buckets.values()].sort((a, b) => b.count - a.count);
    const dominantColors = ranked.slice(0, 5).map((c) =>
        rgbToHex(c.r / c.count, c.g / c.count, c.b / c.count),
    );

    // Accent: prefer mid-sat, mid-value among top buckets
    const accentColors = ranked
        .map((c) => {
            const r = c.r / c.count;
            const g = c.g / c.count;
            const b = c.b / c.count;
            const [, s, v] = rgbToHsv(r, g, b);
            return { hex: rgbToHex(r, g, b), score: s * (1 - Math.abs(v - 0.55)) };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((a) => a.hex);

    // Grayscale + Sobel for edges
    const gray = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const o = i * 4;
        gray[i] = relativeLuminance(data[o] ?? 0, data[o + 1] ?? 0, data[o + 2] ?? 0);
    }

    let edgeSum = 0;
    let edgeCount = 0;
    const edgeMap = new Float32Array(n);
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            const i = y * width + x;
            const gx =
                -gray[i - width - 1]! +
                gray[i - width + 1]! -
                2 * gray[i - 1]! +
                2 * gray[i + 1]! -
                gray[i + width - 1]! +
                gray[i + width + 1]!;
            const gy =
                -gray[i - width - 1]! -
                2 * gray[i - width]! -
                gray[i - width + 1]! +
                gray[i + width - 1]! +
                2 * gray[i + width]! +
                gray[i + width + 1]!;
            const mag = Math.min(1, Math.hypot(gx, gy) * 1.8);
            edgeMap[i] = mag;
            edgeSum += mag;
            edgeCount += 1;
        }
    }
    const edgeDensity = edgeCount ? edgeSum / edgeCount : 0;
    const complexity = clamp(edgeDensity * 0.65 + contrast * 0.25 + saturation * 0.1);

    // Region grid
    const cellW = width / GRID_COLS;
    const cellH = height / GRID_ROWS;
    const regions: RegionScore[] = [];
    let cxSum = 0;
    let cySum = 0;
    let cWeight = 0;

    for (let row = 0; row < GRID_ROWS; row++) {
        for (let col = 0; col < GRID_COLS; col++) {
            const x0 = Math.floor(col * cellW);
            const y0 = Math.floor(row * cellH);
            const x1 = Math.floor((col + 1) * cellW);
            const y1 = Math.floor((row + 1) * cellH);
            let e = 0;
            let br = 0;
            let c = 0;
            for (let y = y0; y < y1; y++) {
                for (let x = x0; x < x1; x++) {
                    const i = y * width + x;
                    e += edgeMap[i] ?? 0;
                    br += gray[i] ?? 0;
                    c += 1;
                }
            }
            const complexityCell = c ? e / c : 0;
            const brightnessCell = c ? br / c : 0;
            regions.push({
                row,
                col,
                complexity: complexityCell,
                brightness: brightnessCell,
            });
            const w = complexityCell + 0.05;
            cxSum += ((col + 0.5) / GRID_COLS) * w;
            cySum += ((row + 0.5) / GRID_ROWS) * w;
            cWeight += w;
        }
    }

    const sortedByComplexity = [...regions].sort(
        (a, b) => a.complexity - b.complexity,
    );
    const emptyRegions = sortedByComplexity.slice(0, 6);
    const busyRegions = [...sortedByComplexity].reverse().slice(0, 6);

    // Lower band (bottom 40%) row averages — where glass card typically sits
    const lowerStart = Math.floor(GRID_ROWS * 0.55);
    const lowerBandComplexity: number[] = [];
    for (let row = lowerStart; row < GRID_ROWS; row++) {
        let sum = 0;
        let cnt = 0;
        for (const r of regions) {
            if (r.row === row) {
                sum += r.complexity;
                cnt += 1;
            }
        }
        lowerBandComplexity.push(cnt ? sum / cnt : 0);
    }

    return {
        width,
        height,
        brightness: meanL,
        contrast,
        saturation,
        warmth,
        whiteBalance,
        dominantColors: dominantColors.length ? dominantColors : ["#C8A66A"],
        accentColors: accentColors.length ? accentColors : dominantColors.slice(0, 2),
        shadowRatio: shadows / n,
        highlightRatio: highlights / n,
        edgeDensity,
        complexity,
        subjectCentroid: {
            x: cWeight ? cxSum / cWeight : 0.5,
            y: cWeight ? cySum / cWeight : 0.45,
        },
        emptyRegions,
        busyRegions,
        lowerBandComplexity,
    };
}

function emptyAnalysis(width: number, height: number): ImageAnalysis {
    return {
        width,
        height,
        brightness: 0.55,
        contrast: 0.25,
        saturation: 0.2,
        warmth: 0.1,
        whiteBalance: 0,
        dominantColors: ["#C8A66A", "#F8F4EC"],
        accentColors: ["#C8A66A"],
        shadowRatio: 0.1,
        highlightRatio: 0.15,
        edgeDensity: 0.2,
        complexity: 0.25,
        subjectCentroid: { x: 0.5, y: 0.4 },
        emptyRegions: [],
        busyRegions: [],
        lowerBandComplexity: [0.2, 0.2, 0.15],
    };
}

/** Browser: load image URL → downsample → analyze. */
export async function analyzeImageUrl(imageUrl: string): Promise<ImageAnalysis> {
    if (typeof document === "undefined") {
        throw new Error("analyzeImageUrl requires a browser environment");
    }

    const img = await loadImage(imageUrl);
    const canvas = document.createElement("canvas");
    canvas.width = ANALYZE_W;
    canvas.height = ANALYZE_H;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas unavailable for image analysis");

    ctx.drawImage(img, 0, 0, ANALYZE_W, ANALYZE_H);
    const imageData = ctx.getImageData(0, 0, ANALYZE_W, ANALYZE_H);
    return analyzePixelBuffer({
        width: ANALYZE_W,
        height: ANALYZE_H,
        data: imageData.data,
    });
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        if (!url.startsWith("data:") && !url.startsWith("blob:")) {
            img.crossOrigin = "anonymous";
        }
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Failed to load image for theme analysis"));
        img.src = url;
    });
}
