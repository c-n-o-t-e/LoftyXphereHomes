import { test, expect } from "@playwright/test";

test.describe("Marketing smoke", () => {
    test("homepage loads with primary navigation", async ({ page }) => {
        await page.goto("/");

        await expect(page).toHaveTitle(/Lofty/i);
        await expect(page.getByRole("link", { name: /apartments/i }).first()).toBeVisible();
        await expect(page.getByRole("main")).toBeVisible();
    });

    test("apartments listing is reachable", async ({ page }) => {
        await page.goto("/apartments");

        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(page.getByText(/night/i).first()).toBeVisible();
    });
});
