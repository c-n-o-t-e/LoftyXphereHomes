import {
    ALLOWED_IMAGE_MIME_TYPES,
    APARTMENT_IMAGE_MAX_BYTES,
    IMAGE_VARIANTS,
} from "@/lib/images/constants";
import {
    processApartmentImage,
    validateImageInput,
} from "@/lib/images/process";
import { buildPublicStorageUrl } from "@/lib/images/storage";

jest.mock("sharp", () => {
    const mockSharp = jest.fn(() => ({
        rotate: jest.fn().mockReturnThis(),
        resize: jest.fn().mockReturnThis(),
        webp: jest.fn().mockReturnThis(),
        toBuffer: jest.fn().mockResolvedValue({
            data: Buffer.from("webp-image"),
            info: { width: 800, height: 600 },
        }),
        metadata: jest.fn().mockResolvedValue({ width: 1200, height: 900 }),
    }));

    return mockSharp;
});

describe("validateImageInput", () => {
    it("rejects unsupported mime types", () => {
        const result = validateImageInput({
            buffer: Buffer.from("abc"),
            mimeType: "application/pdf",
        });
        expect(result.ok).toBe(false);
    });

    it("rejects files over the max size", () => {
        const result = validateImageInput({
            buffer: Buffer.alloc(APARTMENT_IMAGE_MAX_BYTES + 1),
            mimeType: "image/jpeg",
        });
        expect(result.ok).toBe(false);
    });

    it("accepts supported image types", () => {
        const result = validateImageInput({
            buffer: Buffer.from("abc"),
            mimeType: "image/jpeg",
        });
        expect(result.ok).toBe(true);
        expect(ALLOWED_IMAGE_MIME_TYPES.has("image/jpeg")).toBe(true);
    });
});

describe("processApartmentImage", () => {
    it("returns all required variants", async () => {
        const processed = await processApartmentImage(Buffer.from("input"));
        expect(processed.thumbnail.buffer).toBeInstanceOf(Buffer);
        expect(processed.medium.buffer).toBeInstanceOf(Buffer);
        expect(processed.large.buffer).toBeInstanceOf(Buffer);
        expect(processed.original.buffer).toBeInstanceOf(Buffer);
        expect(processed.blurDataUrl.startsWith("data:image/webp;base64,")).toBe(
            true,
        );
        expect(IMAGE_VARIANTS.thumbnail.width).toBe(300);
    });
});

describe("buildPublicStorageUrl", () => {
    it("builds a public Supabase storage URL", () => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
        const url = buildPublicStorageUrl(
            "apartments/lofty-wuye-01/id/thumbnail.webp",
        );
        expect(url).toBe(
            "https://example.supabase.co/storage/v1/object/public/ApartmentImages/apartments/lofty-wuye-01/id/thumbnail.webp",
        );
    });
});
