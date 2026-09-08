import { createDefaultEditorialDocument } from "@/lib/content-studio/defaults";
import { composeTextStack, fitTitleSize } from "@/lib/content-studio/fit-typography";
import { artDirectedHeadline } from "@/lib/content-studio/headline";
import { getLayout } from "@/lib/content-studio/layouts";

describe("content-studio composition fitting", () => {
    it("stacks greeting headlines for minimal luxury", () => {
        const directed = artDirectedHeadline("Happy New Week", "minimal-luxury", "display-stack");
        expect(directed.text).toContain("\n");
        expect(directed.uppercase).toBe(true);
    });

    it("keeps educational titles in mixed case", () => {
        const directed = artDirectedHeadline(
            "5 Things To Know Before Booking A Shortlet",
            "magazine-editorial",
            "preserve",
        );
        expect(directed.uppercase).toBe(false);
        expect(directed.text).toContain("Shortlet");
    });

    it("reduces display size only when the headline overflows the zone", () => {
        const zone = { x: 80, y: 180, w: 920, h: 200 };
        const fitted = fitTitleSize(
            "A remarkably long headline that cannot sit in a short zone without help from the fitter",
            zone,
            {
                titleSize: 118,
                titleWeight: 500,
                titleTracking: -0.03,
                titleLineHeight: 0.96,
                bodySize: 20,
                kickerSize: 12,
                ctaSize: 12,
            },
        );
        expect(fitted).toBeLessThan(118);
        expect(fitted).toBeGreaterThanOrEqual(Math.round(118 * 0.82));
    });

    it("flows kicker, title and body as one stack so short titles do not leave a hole", () => {
        const document = createDefaultEditorialDocument({
            category: "new-week",
            layoutId: "minimal-luxury",
        });
        document.content.title = "Happy New Week";
        const zone = getLayout("minimal-luxury").zones.find((item) => item.type === "text-stack");
        expect(zone).toBeTruthy();
        const items = composeTextStack(document, zone!);
        const types = items.map((item) => item.type);
        expect(types).toContain("title");
        expect(types).toContain("kicker");
        const title = items.find((item) => item.type === "title");
        const subtitle = items.find((item) => item.type === "subtitle");
        if (title && subtitle) {
            expect(subtitle.y).toBeGreaterThan(title.y + title.h);
        }
    });
});
