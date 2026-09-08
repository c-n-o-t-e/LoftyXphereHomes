import {
    applyLayoutToDocument,
    createDefaultEditorialDocument,
} from "@/lib/content-studio/defaults";
import { getLayout, LAYOUT_LIST } from "@/lib/content-studio/layouts";
import { parseEditorialDocument } from "@/lib/content-studio/validation";
import { serializeLayoutJson } from "@/lib/content-studio/layout-engine";

describe("content-studio defaults and layouts", () => {
    it("creates a versioned 1080×1350 document", () => {
        const document = createDefaultEditorialDocument();
        expect(document.version).toBe(1);
        expect(document.format).toBe("portrait-4-5");
        expect(document.fonts.heading).toBe("Playfair Display");
        expect(document.fonts.body).toBe("Inter");
    });

    it("defines all seven approved layouts as JSON", () => {
        expect(LAYOUT_LIST).toHaveLength(7);
        expect(LAYOUT_LIST.map((layout) => layout.letter).join("")).toBe("ABCDEFG");
        for (const layout of LAYOUT_LIST) {
            const json = serializeLayoutJson(layout.id);
            expect(json.layout).toBe(layout.id);
            expect(json.assetStyle).toBe("lxh-editorial");
            expect(layout.assetTreatment).toBeTruthy();
            expect(layout.zones.some((zone) => zone.type === "title" || zone.type === "text-stack")).toBe(true);
        }
    });

    it("repositions the asset when the layout changes", () => {
        const start = createDefaultEditorialDocument({ layoutId: "editorial-split" });
        const next = applyLayoutToDocument(start, "minimal-luxury", {
            keepAssetUrl: true,
        });
        expect(next.layoutId).toBe("minimal-luxury");
        expect(next.asset.x).toBe(getLayout("minimal-luxury").defaultAsset.x);
        expect(next.footer.variant).toBe("logo-only");
    });

    it("round-trips a saved document through validation", () => {
        const document = createDefaultEditorialDocument({
            category: "new-week",
            layoutId: "typography-first",
        });
        const parsed = parseEditorialDocument(document);
        expect(parsed.category).toBe("new-week");
        expect(parsed.layoutId).toBe("typography-first");
        expect(parsed.content.title).toBeTruthy();
    });
});
