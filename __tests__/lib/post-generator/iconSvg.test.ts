import {
    amenityIconSvg,
    contactIconSvg,
} from "@/lib/post-generator/iconSvg";

describe("post-generator iconSvg", () => {
    it("builds Lucide stroke SVGs for amenity icons used in preview", () => {
        const kitchen = amenityIconSvg("kitchen", 46, "#C4A574", 2.45);
        expect(kitchen).toContain('viewBox="0 0 24 24"');
        expect(kitchen).toContain("stroke=");
        expect(kitchen).toContain("M2 12h20"); // cooking-pot rim
        expect(kitchen).toContain("M20 12v8"); // cooking-pot body

        const gamepad = amenityIconSvg("gamepad", 46, "#C4A574", 2.45);
        expect(gamepad).toContain("M17.32 5"); // gamepad-2 body

        const cleaning = amenityIconSvg("cleaning", 46, "#C4A574", 2.45);
        expect(cleaning).toContain("m19 9 2 2");
    });

    it("uses the filled WhatsApp brand mark (not a phone handset)", () => {
        const wa = contactIconSvg("whatsapp", 22, "#C4A574", 2.2);
        expect(wa).toContain('viewBox="0 0 448 512"');
        expect(wa).toContain("fill=");
        expect(wa).toContain("M380.9 97.1");
        expect(wa).not.toContain("stroke-width");
    });

    it("builds Instagram / website stroke icons", () => {
        const ig = contactIconSvg("instagram", 22, "#C4A574", 2.2);
        expect(ig).toContain('rx="5"');
        const web = contactIconSvg("website", 22, "#C4A574", 2.2);
        expect(web).toContain("M2 12h20");
    });
});
