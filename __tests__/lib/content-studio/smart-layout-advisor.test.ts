import {
    inferCategory,
    recommendLayout,
} from "@/lib/content-studio/smart-layout-advisor";
import { recommendEditorialDesign } from "@/lib/content-studio/recommend";

describe("content-studio layout advisor", () => {
    it("recommends magazine editorial for numbered educational titles", () => {
        const result = recommendLayout({
            title: "7 Things To Know Before Booking A Shortlet",
            category: "educational",
        });
        expect(result.layoutId).toBe("magazine-editorial");
    });

    it("recommends minimal luxury for new-week greetings", () => {
        const result = recommendLayout({
            title: "Happy New Week",
            category: "new-week",
        });
        expect(result.layoutId).toBe("minimal-luxury");
        expect(["logo-only", "micro"]).toContain(result.footer);
    });

    it("recommends cut-out for packing tips", () => {
        const result = recommendLayout({
            title: "What To Pack For Your Abuja Stay",
            category: "travel-tips",
        });
        expect(result.layoutId).toBe("cut-out");
    });

    it("recommends full-bleed for nearby places", () => {
        const result = recommendLayout({
            title: "5 Places To Visit Near Wuye",
            category: "abuja-guide",
        });
        expect(result.layoutId).toBe("full-bleed");
    });

    it("infers new-week from title when category is omitted", () => {
        expect(inferCategory("Happy New Week")).toBe("new-week");
    });

    it("returns a complete design recommendation", () => {
        const result = recommendEditorialDesign({
            title: "5 Things To Check Before Booking A Shortlet",
            category: "educational",
        });
        expect(result.layoutId).toBe("magazine-editorial");
        expect(result.visualConcepts).toHaveLength(3);
        expect(result.themeId).toBeTruthy();
        expect(result.visualConcept.toLowerCase()).toMatch(/key|wallet|book/);
    });
});
