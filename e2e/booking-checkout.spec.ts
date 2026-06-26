import { test, expect } from "@playwright/test";
import {
    buildFutureStayDates,
    navigateCalendarToMonth,
    selectEnabledCalendarDay,
} from "./helpers/calendar";

const APARTMENT_ID = "horizon-suite";
const stay = buildFutureStayDates(60, 3);
const E2E_REFERENCE = `e2e:${APARTMENT_ID}:${stay.checkIn}:${stay.checkOut}`;

test.describe("Booking checkout journey", () => {
    test.describe.configure({ mode: "serial" });

    test("guest can complete checkout through mocked Paystack to success page", async ({
        page,
        baseURL,
    }) => {
        await page.route("**/api/availability**", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    apartmentId: APARTMENT_ID,
                    blockedDates: [],
                    bookingRanges: [],
                }),
            });
        });

        await page.route("**/api/paystack/initialize", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    authorization_url: `${baseURL}/booking/success?reference=${encodeURIComponent(E2E_REFERENCE)}`,
                }),
            });
        });

        await page.goto(`/apartments/${APARTMENT_ID}`);

        await expect(
            page.getByRole("heading", { name: /horizon suite/i }),
        ).toBeVisible();
        await expect(page.getByText("Your Reservation")).toBeVisible();

        await page.getByRole("button", { name: /check-in/i }).click();
        await navigateCalendarToMonth(page, stay.monthYear);
        await selectEnabledCalendarDay(page, stay.checkInDay);

        await expect(page.getByRole("button", { name: /check-out/i })).toBeVisible();
        await navigateCalendarToMonth(page, stay.monthYear);
        await selectEnabledCalendarDay(page, stay.checkOutDay);

        await page.getByLabel(/full name/i).fill("E2E Guest");
        await page.getByLabel(/email address/i).fill("e2e-guest@example.com");
        await page.getByLabel(/phone number/i).fill("+2348000000000");

        await expect(
            page.getByRole("button", { name: /^book apartment$/i }),
        ).toBeEnabled();
        await page.getByRole("button", { name: /^book apartment$/i }).click();

        await expect(page).toHaveURL(/\/booking\/success/);
        await expect(page.getByText(/your stay is confirmed/i)).toBeVisible({
            timeout: 15_000,
        });
        await expect(page.getByText(E2E_REFERENCE)).toBeVisible();
        await expect(
            page.getByRole("link", { name: /access my dashboard/i }),
        ).toBeVisible();
    });
});
