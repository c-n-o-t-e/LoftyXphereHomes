import { recommendTheme } from "@/lib/content-studio/smart-color-advisor";

describe("content-studio color advisor", () => {
    it("keeps educational posts in the ivory editorial system", () => {
        const result = recommendTheme({
            category: "educational",
            title: "Five things to know",
        });
        expect(result.themeId).toBe("luxury-editorial");
        expect(result.theme.background).toBe("#F6EFE3");
        expect(result.theme.gold).toBe("#C8A66A");
    });

    it("uses seasonal terracotta only when the copy is seasonal", () => {
        const result = recommendTheme({
            category: "holiday",
            title: "A festive stay in Abuja",
        });
        expect(result.themeId).toBe("seasonal");
        expect(result.theme.accent).toBe("#9E4E2E");
    });

    it("uses charcoal for announcements", () => {
        const result = recommendTheme({
            category: "announcement",
            title: "Now open",
        });
        expect(result.themeId).toBe("dark-editorial");
        expect(result.theme.background).toBe("#241A14");
    });
});
