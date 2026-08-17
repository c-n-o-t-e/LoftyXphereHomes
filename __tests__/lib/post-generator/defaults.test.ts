import {
    applyPreset,
    createDefaultPostDocument,
    mergePostDocument,
    REFERENCE_THEME,
} from "@/lib/post-generator/defaults";
import {
    createPostTemplateBodySchema,
    normalizePostPresetKey,
    normalizeSavedPostDocument,
    parsePostDocument,
} from "@/lib/post-generator/validation";
import { POST_DOCUMENT_VERSION, type PostDocument } from "@/lib/post-generator/types";
import { POST_TOKENS } from "@/lib/post-generator/tokens";

/** Three legacy fingerprint signals that are also valid editor choices. */
function intentionalLegacyLookingDocument(
    version: PostDocument["version"],
): PostDocument {
    const current = createDefaultPostDocument();
    return {
        ...current,
        version,
        button: { ...current.button, borderRadius: 999 },
        overlay: {
            ...current.overlay,
            opacity: 0.9,
            cardInsetX: 30,
        },
        amenitiesStyle: {
            ...current.amenitiesStyle,
            columns: 4,
            goldLabels: true,
        },
    };
}

describe("post-generator defaults", () => {
    it("matches the approved warm ivory / champagne reference", () => {
        const doc = createDefaultPostDocument();
        expect(doc.theme.background).toBe(POST_TOKENS.colors.ivory);
        expect(doc.theme.gold).toBe(POST_TOKENS.colors.gold);
        expect(REFERENCE_THEME.background).toBe(POST_TOKENS.colors.ivory);
        expect(doc.overlay.photoHeightPercent).toBeGreaterThanOrEqual(53);
        expect(doc.overlay.photoHeightPercent).toBeLessThanOrEqual(57);
        expect(doc.layout.outerPadding).toBeGreaterThanOrEqual(28);
        expect(doc.layout.outerPadding).toBeLessThanOrEqual(36);
        expect(doc.overlay.photoFadePercent).toBeGreaterThanOrEqual(16);
        expect(doc.overlay.opacity).toBeLessThanOrEqual(0.22);
        expect(doc.overlay.blur).toBeGreaterThanOrEqual(12);
        expect(doc.overlay.cardOffsetY).toBeGreaterThanOrEqual(-8);
        expect(doc.overlay.cardOffsetY).toBeLessThanOrEqual(24);
        expect(doc.overlay.footerGap).toBeLessThanOrEqual(22);
        expect(doc.layout.borderThickness).toBeLessThanOrEqual(2);
        expect(doc.layout.borderRadius).toBeGreaterThanOrEqual(24);
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
        expect(doc.headline.fontSize).toBeGreaterThanOrEqual(50);
        expect(doc.headline.fontSize).toBeLessThanOrEqual(56);
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

    it("preserves a dense glass overlay instead of treating it as a legacy card", () => {
        const parsed = parsePostDocument({
            version: POST_DOCUMENT_VERSION,
            overlay: { opacity: 0.96 },
            headline: { fontSize: 56 },
        });
        expect(parsed.overlay.opacity).toBe(0.96);
        expect(parsed.headline.fontSize).toBe(56);
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

    it("applies the single luxury-editorial layout", () => {
        const editorial = applyPreset("luxury-editorial");
        const defaults = createDefaultPostDocument();
        expect(editorial.overlay.photoHeightPercent).toBe(
            defaults.overlay.photoHeightPercent,
        );
        expect(editorial.amenities).toHaveLength(defaults.amenities.length);
        expect(editorial.theme.background).toBe(defaults.theme.background);
        expect(editorial.fonts.heading).toBe("Playfair Display");
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

    it("still migrates unsaved v1 cream fingerprints on load", () => {
        const loaded = parsePostDocument(intentionalLegacyLookingDocument(1));
        expect(loaded.version).toBe(POST_DOCUMENT_VERSION);
        expect(loaded.amenitiesStyle.columns).toBe(8);
        expect(loaded.amenitiesStyle.goldLabels).toBe(false);
        expect(loaded.overlay.cardInsetX).toBe(POST_TOKENS.glass.cardInsetX);
        expect(loaded.overlay.opacity).toBe(POST_TOKENS.glass.opacity);
        expect(loaded.button.borderRadius).toBe(POST_TOKENS.type.ctaRadius);
    });

    it("keeps intentional editor settings across save then reload", () => {
        const edited = intentionalLegacyLookingDocument(1);
        const saved = normalizeSavedPostDocument(edited);
        expect(saved.version).toBe(POST_DOCUMENT_VERSION);
        expect(saved.button.borderRadius).toBe(999);
        expect(saved.overlay.opacity).toBe(0.9);
        expect(saved.overlay.cardInsetX).toBe(30);
        expect(saved.amenitiesStyle.columns).toBe(4);
        expect(saved.amenitiesStyle.goldLabels).toBe(true);

        const reloaded = parsePostDocument(saved);
        expect(reloaded.button.borderRadius).toBe(999);
        expect(reloaded.overlay.opacity).toBe(0.9);
        expect(reloaded.overlay.cardInsetX).toBe(30);
        expect(reloaded.amenitiesStyle.columns).toBe(4);
        expect(reloaded.amenitiesStyle.goldLabels).toBe(true);
    });

    it("does not migrate a current-version document that matches the old fingerprint", () => {
        const current = parsePostDocument(intentionalLegacyLookingDocument(2));
        expect(current.button.borderRadius).toBe(999);
        expect(current.overlay.opacity).toBe(0.9);
        expect(current.amenitiesStyle.columns).toBe(4);
        expect(current.amenitiesStyle.goldLabels).toBe(true);
    });

    it("migrates the previous 62/14 pinned-footer default on load", () => {
        const parsed = parsePostDocument({
            version: POST_DOCUMENT_VERSION,
            overlay: {
                photoHeightPercent: 62,
                overlapPercent: 14,
                photoFadePercent: 13,
                cardOffsetY: -40,
                footerGap: 28,
                opacity: 0.28,
            },
            layout: {
                outerPadding: 28,
                contentPaddingX: 40,
                contentPaddingTop: 34,
            },
            headline: { fontSize: 58 },
        });
        expect(parsed.overlay.photoHeightPercent).toBe(POST_TOKENS.photo.heightPercent);
        expect(parsed.overlay.overlapPercent).toBe(POST_TOKENS.photo.overlapPercent);
        expect(parsed.overlay.photoFadePercent).toBe(POST_TOKENS.photo.fadePercent);
        expect(parsed.overlay.cardOffsetY).toBe(POST_TOKENS.glass.cardOffsetY);
        expect(parsed.overlay.footerGap).toBe(POST_TOKENS.spacing.footerGap);
        expect(parsed.headline.fontSize).toBe(POST_TOKENS.type.headlineSize);
        expect(parsed.layout.contentPaddingTop).toBe(
            POST_TOKENS.spacing.contentPaddingTop,
        );
    });

    it("does not rewrite 62/14 on save — load migration is the upgrade path", () => {
        const current = createDefaultPostDocument();
        const saved = normalizeSavedPostDocument({
            ...current,
            overlay: {
                ...current.overlay,
                photoHeightPercent: 62,
                overlapPercent: 14,
            },
        });
        expect(saved.overlay.photoHeightPercent).toBe(62);
        expect(saved.overlay.overlapPercent).toBe(14);
    });

    it("stamps new documents at the current version", () => {
        expect(createDefaultPostDocument().version).toBe(POST_DOCUMENT_VERSION);
        expect(applyPreset("luxury-editorial").version).toBe(POST_DOCUMENT_VERSION);
        expect(
            normalizeSavedPostDocument(applyPreset("luxury-editorial")).overlay
                .opacity,
        ).toBe(createDefaultPostDocument().overlay.opacity);
    });

    it("coerces leftover preset keys to luxury-editorial", () => {
        const created = createPostTemplateBodySchema.parse({
            title: "Test",
            presetKey: "dark-luxury",
        });
        expect(created.presetKey).toBe("luxury-editorial");
        expect(normalizePostPresetKey("boutique-hotel")).toBe("luxury-editorial");
        expect(normalizePostPresetKey(null)).toBeNull();
    });
});
