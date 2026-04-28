import {
    deriveStayStartDate,
    formatMonthTabTitle,
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
});
