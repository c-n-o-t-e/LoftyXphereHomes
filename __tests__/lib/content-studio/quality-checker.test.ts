import { createDefaultEditorialDocument } from "@/lib/content-studio/defaults";
import { checkEditorialQuality } from "@/lib/content-studio/quality-checker";

describe("content-studio quality checker", () => {
    it("marks a default magazine post ready when the headline fits", () => {
        const document = createDefaultEditorialDocument({
            category: "educational",
            layoutId: "magazine-editorial",
        });
        const report = checkEditorialQuality(document);
        expect(report.ready).toBe(true);
    });

    it("flags an empty headline as an error", () => {
        const document = createDefaultEditorialDocument();
        document.content.title = "";
        const report = checkEditorialQuality(document);
        expect(report.ready).toBe(false);
        expect(report.issues.some((issue) => issue.id === "title-empty")).toBe(true);
    });

    it("flags a dominating logo", () => {
        const document = createDefaultEditorialDocument();
        document.logo.size = 200;
        const report = checkEditorialQuality(document);
        expect(report.issues.some((issue) => issue.id === "logo-dominant")).toBe(true);
    });

    it("flags title overflow on a long headline", () => {
        const document = createDefaultEditorialDocument({
            layoutId: "minimal-luxury",
        });
        document.typography.titleSize = 140;
        document.content.title =
            "A remarkably long headline that cannot possibly sit inside a restrained luxury composition without colliding with the footer and the supporting object in every direction of the page";
        const report = checkEditorialQuality(document);
        expect(report.issues.some((issue) => issue.id === "title-overflow")).toBe(true);
    });
});
