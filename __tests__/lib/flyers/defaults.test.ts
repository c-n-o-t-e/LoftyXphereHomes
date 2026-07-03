import { createDefaultFlyerPayload } from "@/lib/flyers/defaults";
import { FLYER_TEMPLATE_OPTIONS } from "@/lib/flyers/constants";
import { parseFlyerPayload } from "@/lib/flyers/validation";
import { resolveFlyerQrUrl } from "@/lib/flyers/qr";
import { getFlyerBaseFontSize, getFlyerDimensions, getFlyerPreviewCssSize } from "@/lib/flyers/dimensions";
import { getAmenityIcon, getDefaultFlyerAmenityKeys } from "@/lib/amenities/suiteAmenities";

describe("flyer defaults and validation", () => {
    it("creates a valid default payload", () => {
        const payload = createDefaultFlyerPayload();
        const parsed = parseFlyerPayload(payload);

        expect(parsed.headline).toContain("LUXURY");
        expect(parsed.amenities.length).toBeGreaterThan(15);
        expect(parsed.gridImageOrder).toHaveLength(6);
        expect(parsed.amenities).toEqual(getDefaultFlyerAmenityKeys());
        expect(parsed.discoveryLine).toContain("luxury apartments");
    });

    it("exposes five premium templates", () => {
        expect(FLYER_TEMPLATE_OPTIONS).toHaveLength(5);
        expect(FLYER_TEMPLATE_OPTIONS.map((item) => item.key)).toEqual([
            "luxury-minimal",
            "modern-premium",
            "hotel-style",
            "magazine-style",
            "corporate-executive",
        ]);
    });

    it("resolves QR destination URLs", () => {
        const payload = createDefaultFlyerPayload({
            qr: { destinationType: "website" },
        });
        expect(resolveFlyerQrUrl(payload)).toMatch(/^https?:\/\//);
    });

    it("uses 300 DPI dimensions for A5 print", () => {
        const dims = getFlyerDimensions("a5-portrait");
        expect(dims.widthPx).toBeGreaterThan(1700);
        expect(dims.heightPx).toBeGreaterThan(2400);
        expect(dims.bleedPx).toBeGreaterThan(30);
    });

    it("derives CSS preview size from mm at 96 DPI", () => {
        const preview = getFlyerPreviewCssSize("a5-portrait");
        expect(preview.widthPx).toBeCloseTo(559, 0);
        expect(preview.heightPx).toBeCloseTo(794, 0);
    });

    it("scales root font size with page width for export", () => {
        expect(getFlyerBaseFontSize("a5-portrait", true)).toBe("50px");
        expect(getFlyerBaseFontSize("a4-landscape", true)).toBe("50px");
    });

    it("resets legacy amenity keys to the current suite catalog", () => {
        const payload = createDefaultFlyerPayload();
        const legacy = {
            ...payload,
            amenities: ["self-compound", "cctv", "workspace"],
        };

        const parsed = parseFlyerPayload(legacy);

        expect(parsed.amenities).toEqual(getDefaultFlyerAmenityKeys());
    });

    it("upgrades partial legacy amenity selections to the full suite list", () => {
        const payload = createDefaultFlyerPayload();
        const partialLegacy = {
            ...payload,
            amenities: ["swimming-pool", "smart-tv", "electricity-247", "customer-service"],
        };

        const parsed = parseFlyerPayload(partialLegacy);

        expect(parsed.amenities).toHaveLength(17);
        expect(parsed.amenities).toEqual(getDefaultFlyerAmenityKeys());
    });

    it("backfills missing image slots when upgrading legacy payloads", () => {
        const payload = createDefaultFlyerPayload();
        const legacy = {
            ...payload,
            images: Object.fromEntries(
                Object.entries(payload.images).filter(
                    ([key]) => key !== "gym" && key !== "exterior",
                ),
            ),
            gridImageOrder: ["livingRoom", "bedroom", "kitchen", "pool"],
        };

        const parsed = parseFlyerPayload(legacy);

        expect(parsed.images.gym).toEqual({
            url: null,
            alt: "Gym",
            label: "Gym",
        });
        expect(parsed.images.exterior).toEqual({
            url: null,
            alt: "Exterior",
            label: "Exterior",
        });
        expect(parsed.gridImageOrder).toHaveLength(6);
    });

    it("backfills discovery line on legacy payloads", () => {
        const payload = createDefaultFlyerPayload();
        const { discoveryLine: _removed, ...legacy } = payload;

        const parsed = parseFlyerPayload(legacy);

        expect(parsed.discoveryLine.length).toBeGreaterThan(0);
    });

    it("maps amenity labels to representative icons", () => {
        expect(getAmenityIcon("Swimming pool")).toBe("🏊");
        expect(getAmenityIcon("24/7 electricity (solar, inverter & generator)")).toBe("⚡");
        expect(getAmenityIcon("Starlink Wi-Fi")).toBe("📶");
    });
});
