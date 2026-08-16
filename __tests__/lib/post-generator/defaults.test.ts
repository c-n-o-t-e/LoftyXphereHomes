import {
    applyPreset,
    createDefaultPostDocument,
    mergePostDocument,
    REFERENCE_THEME,
} from "@/lib/post-generator/defaults";
import { parsePostDocument } from "@/lib/post-generator/validation";
import { POST_TOKENS } from "@/lib/post-generator/tokens";

describe("post-generator defaults", () => {
    it("matches the approved warm ivory / champagne reference", () => {
        const doc = createDefaultPostDocument();
        expect(doc.theme.background).toBe(POST_TOKENS.colors.ivory);
        expect(doc.theme.gold).toBe(POST_TOKENS.colors.gold);
        expect(REFERENCE_THEME.background).toBe(POST_TOKENS.colors.ivory);
        expect(doc.overlay.photoHeightPercent).toBeGreaterThanOrEqual(58);
        expect(doc.overlay.photoHeightPercent).toBeLessThanOrEqual(68);
        expect(doc.layout.outerPadding).toBeGreaterThanOrEqual(24);
        expect(doc.layout.outerPadding).toBeLessThanOrEqual(32);
        expect(doc.overlay.photoFadePercent).toBeGreaterThanOrEqual(10);
        expect(doc.overlay.opacity).toBeLessThanOrEqual(0.4);
        expect(doc.overlay.blur).toBeGreaterThanOrEqual(18);
        expect(doc.overlay.cardOffsetY).toBeLessThan(0);
        expect(doc.layout.borderThickness).toBeLessThanOrEqual(2);
        expect(doc.layout.borderRadius).toBeGreaterThanOrEqual(28);
        expect(doc.amenities.filter((a) => a.visible)).toHaveLength(8);
        expect(doc.amenitiesStyle.columns).toBe(8);
        expect(doc.amenitiesStyle.goldLabels).toBe(false);
        expect(doc.headline.showAccentDivider).toBe(false);
        expect(doc.button.borderRadius).toBeLessThan(100);
        expect(doc.contactStyle.iconSize).toBeGreaterThanOrEqual(24);
        expect(doc.contactStyle.fontSize).toBeGreaterThanOrEqual(16);
        expect(doc.contactStyle.fontWeight).toBeLessThanOrEqual(500);
        expect(doc.contactStyle.iconColor).toBe(POST_TOKENS.colors.gold);
        expect(doc.contactStyle.textColor).toBe(POST_TOKENS.colors.text);
        expect(doc.contact.some((c) => c.type === "whatsapp" && c.visible)).toBe(true);
        expect(doc.headline.accentWord).toContain("Expectations");
        expect(doc.headline.fontSize).toBeGreaterThanOrEqual(56);
        expect(doc.button.text).toMatch(/BOOK YOUR STAY/i);
    });

    it("migrates old opaque cream cards to approved glass layout", () => {
        const parsed = parsePostDocument({
            version: 1,
            amenities: Array.from({ length: 8 }, (_, i) => ({
                id: `a${i}`,
                label: `Item ${i}`,
                icon: "wifi",
                visible: true,
            })),
            amenitiesStyle: {
                columns: 4,
                iconSize: 46,
                goldLabels: true,
            },
            overlay: {
                cardInsetX: 30,
                opacity: 0.97,
                photoHeightPercent: 68,
            },
            layout: { outerPadding: 14, contentPaddingX: 46 },
            button: { borderRadius: 999, backgroundColor: "#C4A574" },
            theme: { background: "#F7F3EC", gold: "#C4A574" },
            headline: {
                accentWord: "Expectations.",
                showAccentDivider: true,
                fontSize: 52,
                accentColor: "#C4A574",
            },
            contactStyle: {
                iconColor: POST_TOKENS.colors.gold,
                textColor: POST_TOKENS.colors.gold,
            },
        });
        expect(parsed.amenitiesStyle.columns).toBe(8);
        expect(parsed.amenitiesStyle.goldLabels).toBe(false);
        expect(parsed.overlay.cardInsetX).toBe(POST_TOKENS.glass.cardInsetX);
        expect(parsed.overlay.opacity).toBe(POST_TOKENS.glass.opacity);
        expect(parsed.overlay.photoHeightPercent).toBe(POST_TOKENS.photo.heightPercent);
        expect(parsed.overlay.photoFadePercent).toBe(POST_TOKENS.photo.fadePercent);
        expect(parsed.layout.outerPadding).toBe(POST_TOKENS.frame.borderInset);
        expect(parsed.layout.contentPaddingX).toBe(POST_TOKENS.spacing.contentPaddingX);
        expect(parsed.theme.background).toBe(POST_TOKENS.colors.ivory);
        expect(parsed.theme.gold).toBe(POST_TOKENS.colors.gold);
        expect(parsed.button.borderRadius).toBe(POST_TOKENS.type.ctaRadius);
        expect(parsed.headline.showAccentDivider).toBe(false);
        expect(parsed.headline.fontSize).toBe(POST_TOKENS.type.headlineSize);
        expect(parsed.contactStyle.textColor).toBe(POST_TOKENS.colors.text);
    });

    it("does not rewrite valid editor choices on merge or parse", () => {
        const current = createDefaultPostDocument();
        const patch = {
            amenitiesStyle: { ...current.amenitiesStyle, columns: 4 },
            overlay: {
                ...current.overlay,
                opacity: 0.9,
                photoHeightPercent: 65,
                cardInsetX: 26,
            },
            headline: { ...current.headline, fontSize: 52 },
        };
        const merged = mergePostDocument(current, patch);
        expect(merged.amenitiesStyle.columns).toBe(4);
        expect(merged.overlay.opacity).toBe(0.9);
        expect(merged.overlay.photoHeightPercent).toBe(65);
        expect(merged.overlay.cardInsetX).toBe(26);
        expect(merged.headline.fontSize).toBe(52);

        const reparsed = parsePostDocument(merged);
        expect(reparsed.amenitiesStyle.columns).toBe(4);
        expect(reparsed.overlay.opacity).toBe(0.9);
        expect(reparsed.overlay.photoHeightPercent).toBe(65);
        expect(reparsed.overlay.cardInsetX).toBe(26);
        expect(reparsed.headline.fontSize).toBe(52);
    });

    it("keeps boutique-hotel glass opacity instead of treating it as a legacy card", () => {
        const boutique = applyPreset("boutique-hotel");
        expect(boutique.overlay.opacity).toBe(0.96);
        expect(boutique.headline.fontSize).toBe(56);
    });

    it("fills missing footer icon/text colours on older templates", () => {
        const parsed = parsePostDocument({
            version: 1,
            contactStyle: {
                iconSize: 22,
                strokeWidth: 2,
                fontSize: 15,
                fontWeight: 500,
                gap: 10,
                paddingY: 12,
            },
        });
        expect(parsed.contactStyle.iconColor).toBe(POST_TOKENS.colors.gold);
        expect(parsed.contactStyle.textColor).toBe(POST_TOKENS.colors.text);
        expect(parsed.contactStyle.fontSize).toBe(15);
        expect(parsed.contactStyle.iconSize).toBe(22);
    });

    it("preserves an explicit gold-on-gold footer", () => {
        const parsed = parsePostDocument({
            version: 1,
            contactStyle: {
                iconColor: POST_TOKENS.colors.gold,
                textColor: POST_TOKENS.colors.gold,
            },
        });
        expect(parsed.contactStyle.iconColor).toBe(POST_TOKENS.colors.gold);
        expect(parsed.contactStyle.textColor).toBe(POST_TOKENS.colors.gold);
    });

    it("splits a legacy single footer colour into icon + text", () => {
        const parsed = parsePostDocument({
            version: 1,
            contactStyle: {
                color: "#1A1A1A",
            } as never,
        });
        expect(parsed.contactStyle.iconColor).toBe("#1A1A1A");
        expect(parsed.contactStyle.textColor).toBe("#1A1A1A");
    });

    it("keeps layout language across presets", () => {
        const editorial = applyPreset("luxury-editorial");
        const dark = applyPreset("dark-luxury");
        expect(dark.overlay.photoHeightPercent).toBe(editorial.overlay.photoHeightPercent);
        expect(dark.amenities).toHaveLength(editorial.amenities.length);
        expect(dark.theme.background).not.toBe(editorial.theme.background);
    });

    it("parses incomplete documents without wiping defaults", () => {
        const parsed = parsePostDocument({
            version: 1,
            headline: { line1: "Stay" },
        });
        expect(parsed.headline.line1).toBe("Stay");
        expect(parsed.theme.gold).toBeTruthy();
        expect(parsed.amenities.length).toBeGreaterThan(0);
        expect(parsed.overlay.photoFadePercent).toBeDefined();
        expect(parsed.overlay.cardOffsetY).toBeDefined();
    });
});
