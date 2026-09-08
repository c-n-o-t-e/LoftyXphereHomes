import { artDirectAsset, targetAssetCoverage } from "@/lib/content-studio/asset-direction";
import {
    applyLayoutToDocument,
    createDefaultEditorialDocument,
} from "@/lib/content-studio/defaults";
import { assetCoverage } from "@/lib/content-studio/fit-typography";
import { getLayout } from "@/lib/content-studio/layouts";

describe("content-studio asset direction", () => {
    it("gives cut-out and split layouts a hero-scale object (30–55%)", () => {
        for (const layoutId of ["editorial-split", "cut-out"] as const) {
            const document = createDefaultEditorialDocument({ layoutId });
            const coverage = assetCoverage(document);
            expect(coverage).toBeGreaterThanOrEqual(0.3);
            expect(coverage).toBeLessThanOrEqual(0.55);
            expect(targetAssetCoverage(getLayout(layoutId)).ideal).toBeGreaterThanOrEqual(0.3);
        }
    });

    it("enlarges the object when the headline is short and the page has leftover space", () => {
        const layout = getLayout("minimal-luxury");
        const compact = artDirectAsset(
            layout,
            {
                kicker: "A New Week",
                title: "Happy New Week",
                subtitle: "",
                body: "",
                cta: "",
                points: [],
                keywords: [],
            },
            { ...layout.defaultAsset, url: null, concept: "", category: "lifestyle" },
        );
        const dense = artDirectAsset(
            layout,
            {
                kicker: "Hospitality",
                title: "Why a considered stay in Abuja asks more of the room than most listings admit",
                subtitle: "A longer supporting line about linen, light and quiet.",
                body: "Hospitality is the quiet work of anticipating what a guest needs before they ask.",
                cta: "",
                points: [],
                keywords: [],
            },
            { ...layout.defaultAsset, url: null, concept: "", category: "lifestyle" },
        );

        const compactArea = compact.width * compact.scale * compact.height * compact.scale;
        const denseArea = dense.width * dense.scale * dense.height * dense.scale;
        expect(compactArea).toBeGreaterThan(denseArea);
        expect(compact.x).not.toBe(540);
    });

    it("keeps the generated visual when switching layout, but re-scales it to the new composition", () => {
        const start = createDefaultEditorialDocument({ layoutId: "editorial-split" });
        start.asset.url = "https://example.com/key.png";
        const next = applyLayoutToDocument(start, "cut-out", { keepAssetUrl: true });
        expect(next.asset.url).toBe("https://example.com/key.png");
        expect(assetCoverage(next)).toBeGreaterThanOrEqual(0.3);
        expect(next.asset.x).toBe(540);
        expect(next.asset.rotation).toBe(0);
    });
});
