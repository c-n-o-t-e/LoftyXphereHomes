import type { Page } from "@playwright/test";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

function monthIndex(monthName: string): number {
    return MONTHS.indexOf(monthName);
}

function monthValue(year: number, monthName: string): number {
    return year * 12 + monthIndex(monthName);
}

async function readVisibleCalendarMonth(page: Page): Promise<string> {
    const text = await page
        .locator("span.text-sm.font-bold.text-black")
        .first()
        .textContent();
    return text?.trim() ?? "";
}

export async function navigateCalendarToMonth(
    page: Page,
    monthYear: string,
): Promise<void> {
    const [targetMonth, targetYear] = monthYear.split(" ");
    const target = monthValue(Number(targetYear), targetMonth);

    for (let attempt = 0; attempt < 48; attempt++) {
        const visible = await readVisibleCalendarMonth(page);
        if (visible === monthYear) return;

        const [currentMonth, currentYear] = visible.split(" ");
        const current = monthValue(Number(currentYear), currentMonth);

        if (current < target) {
            await page.getByRole("button", { name: "Next month" }).click();
        } else {
            await page.getByRole("button", { name: "Previous month" }).click();
        }
    }

    throw new Error(`Could not navigate calendar to ${monthYear}`);
}

export async function selectEnabledCalendarDay(
    page: Page,
    day: number,
): Promise<void> {
    const dayButton = page
        .getByRole("button", { name: String(day), exact: true })
        .and(page.locator(":not([disabled])"))
        .first();

    await dayButton.click();
}

export function buildFutureStayDates(offsetDays = 60, nights = 3) {
    const checkInDate = new Date();
    checkInDate.setHours(12, 0, 0, 0);
    checkInDate.setDate(checkInDate.getDate() + offsetDays);

    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + nights);

    const toIso = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    return {
        checkIn: toIso(checkInDate),
        checkOut: toIso(checkOutDate),
        monthYear: checkInDate.toLocaleString("en-US", {
            month: "long",
            year: "numeric",
        }),
        checkInDay: checkInDate.getDate(),
        checkOutDay: checkOutDate.getDate(),
    };
}
