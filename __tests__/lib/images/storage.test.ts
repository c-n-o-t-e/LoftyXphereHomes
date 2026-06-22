import { buildPublicStorageUrl, buildStorageKeyBase } from "@/lib/images/storage";

describe("image storage helpers", () => {
    beforeEach(() => {
        process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    });

    it("builds a stable storage key base", () => {
        expect(buildStorageKeyBase("lofty-wuye-01", "img-1")).toBe(
            "apartments/lofty-wuye-01/img-1",
        );
    });

    it("builds a public storage URL", () => {
        expect(
            buildPublicStorageUrl("apartments/lofty-wuye-01/id/thumbnail.webp"),
        ).toBe(
            "https://example.supabase.co/storage/v1/object/public/ApartmentImages/apartments/lofty-wuye-01/id/thumbnail.webp",
        );
    });
});
