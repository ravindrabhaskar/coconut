import { test, expect } from "@playwright/test";

const ROUTES = ["/", "/explore", "/explore/hard-shell", "/products", "/products/activated-carbon", "/processing", "/machinery", "/factory", "/build/desiccated-coconut", "/business", "/business/schemes", "/markets", "/markets/prices", "/locations", "/india", "/research", "/research/gaps", "/tools", "/tools/factory-planner", "/tools/mass-balance", "/tools/financial-model", "/tools/compare", "/search?q=shell"];

for (const r of ROUTES) {
  test(`renders ${r}`, async ({ page }) => {
    const res = await page.goto(r);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1").first()).toBeVisible();
    // No horizontal overflow at any viewport
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow, `horizontal overflow on ${r}`).toBe(false);
  });
}

test("old URLs redirect permanently", async ({ request }) => {
  for (const [from, to] of [["/manufacturing/factory-planner", "/tools/factory-planner"], ["/manufacturing/processes/steam-activation", "/processing/steam-activation"], ["/compare", "/tools/compare"], ["/opportunities/finder", "/tools/opportunity-finder"]]) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect([301, 308]).toContain(res.status());
    expect(res.headers()["location"]).toContain(to);
  }
});

test("evidence badge opens provenance popover", async ({ page }) => {
  await page.goto("/products/desiccated-coconut");
  const badge = page.getByRole("button", { name: /Evidence: Verified fact/ }).first();
  await badge.click();
  const dialog = page.getByRole("dialog", { name: "Evidence details" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("Verified by");
  await expect(dialog).toContainText("FSS");
});

test("scenario flows from mass balance to financial model", async ({ page }) => {
  await page.goto("/tools/mass-balance");
  await page.getByRole("button", { name: "Use this balance in my scenario" }).click();
  await page.goto("/tools/financial-model");
  await expect(page.getByText(/Product:/).first()).toBeVisible();
});

test("mobile menu opens as bottom sheet", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
});
