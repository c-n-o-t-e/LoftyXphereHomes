import { campaignCta, footerBarItems, seriesNumber } from "@/lib/content-studio/chrome";
import { createDefaultEditorialDocument } from "@/lib/content-studio/defaults";

describe("content-studio campaign chrome", () => {
    it("fills in the booking cluster when copy is missing", () => {
        const cta = campaignCta({
            kicker: "",
            title: "",
            subtitle: "",
            body: "",
            cta: "",
            ctaScript: "",
            ctaButton: "",
            seriesNumber: "",
            points: [],
            keywords: [],
        });
        expect(cta.invitation).toBe("Book Your Next Stay");
        expect(cta.script).toBe("With Us!");
        expect(cta.button).toBe("BOOK NOW");
    });

    it("pads series numbers to two digits", () => {
        expect(seriesNumber({
            kicker: "Travel Tips",
            title: "",
            subtitle: "",
            body: "",
            cta: "",
            ctaScript: "",
            ctaButton: "",
            seriesNumber: "1",
            points: [],
            keywords: [],
        })).toBe("01");
    });

    it("builds the footer bar from website, instagram and phone", () => {
        const document = createDefaultEditorialDocument({ layoutId: "editorial-split" });
        const items = footerBarItems(document.footer);
        expect(items.map((item) => item.key)).toEqual(["website", "instagram", "phone"]);
        expect(document.content.cta).toBeTruthy();
        expect(document.asset.x).toBe(540);
    });
});
