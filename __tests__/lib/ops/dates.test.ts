import {
    deriveStayStartDate,
    formatMonthApartmentTabTitle,
    formatMonthTabTitle,
    GOOGLE_SHEETS_TAB_TITLE_MAX_LENGTH,
    sanitizeSheetTitleApartmentSegment,
    sheetMonthDateForBooking,
} from "@/lib/ops/dates";

describe("dates (Sheets parity)", () => {
    it("formatMonthTabTitle uses long English month and year", () => {
        const d = new Date(Date.UTC(2026, 7, 15)); // Aug
        expect(formatMonthTabTitle(d)).toMatch(/August\s+2026/i);
    });

    it("deriveStayStartDate parses YYYY-MM-DD as stable UTC noon", () => {
        const bookingDate = new Date("2026-04-01T12:00:00.000Z");
        const out = deriveStayStartDate("2026-08-10", bookingDate);
        expect(out).not.toBeNull();
        expect(out!.toISOString().slice(0, 10)).toBe("2026-08-10");
    });

    it("sheetMonthDateForBooking prefers check-in month over booking date", () => {
        const bookingDate = new Date("2026-04-28T12:00:00.000Z");
        const m = sheetMonthDateForBooking("2026-08-10", bookingDate);
        expect(m.getUTCMonth()).toBe(7); // August
    });

    it("formatMonthApartmentTabTitle combines month and apartment id", () => {
        const d = new Date(Date.UTC(2026, 4, 1)); // May
        expect(formatMonthApartmentTabTitle(d, "lofty-wuye-01")).toBe(
            "May 2026 — lofty-wuye-01",
        );
    });

    it("sanitizeSheetTitleApartmentSegment removes forbidden sheet-name characters", () => {
        expect(sanitizeSheetTitleApartmentSegment("a/b*c?d:e[f]g")).toBe(
            "a-b-c-d-e-f-g",
        );
        expect(sanitizeSheetTitleApartmentSegment("x\\y")).toBe("x-y");
    });

    it("formatMonthApartmentTabTitle truncates long apartment segment to fit 100 chars", () => {
        const d = new Date(Date.UTC(2026, 4, 1));
        const longId = "x".repeat(120);
        const title = formatMonthApartmentTabTitle(d, longId);
        expect(title.length).toBeLessThanOrEqual(GOOGLE_SHEETS_TAB_TITLE_MAX_LENGTH);
        expect(title.startsWith("May 2026 — ")).toBe(true);
    });

    it("formatMonthApartmentTabTitle uses unknown when apartment is empty after sanitize", () => {
        const d = new Date(Date.UTC(2026, 4, 1));
        expect(formatMonthApartmentTabTitle(d, "   ///   ")).toMatch(
            /May 2026 — unknown/,
        );
    });
});
