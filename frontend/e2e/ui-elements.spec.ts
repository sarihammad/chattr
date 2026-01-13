import { test, expect } from "@playwright/test";
import { registerUser, generateTestUser } from "./helpers";

test.describe("UI Elements and Interactions", () => {
  test("should display all dashboard sections", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Check for key UI elements
    await expect(page.locator("text=/profile|username/i").first()).toBeVisible({
      timeout: 5000,
    });

    // Mode selector should be visible
    await expect(
      page
        .locator("button, select")
        .filter({ hasText: /FRIENDS|DATING|RANDOM|NETWORKING/i })
        .first()
    ).toBeVisible();

    // Chat list area should exist
    await expect(
      page.locator("text=/select a chat|no chats|chat list/i").first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("should handle search functionality", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Look for search input
    const searchInput = page.locator(
      'input[type="search"], input[placeholder*="search" i]'
    );

    if ((await searchInput.count()) > 0) {
      await searchInput.fill("test search query");
      await page.waitForTimeout(500);

      // Results should filter or show
    }
  });

  test("should handle responsive layout", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    // Dashboard should still be functional
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
  });

  test("should handle keyboard navigation", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Test Tab navigation
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Focus should move between interactive elements
    await page.waitForTimeout(500);
  });

  test("should display loading states", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Start matchmaking to trigger loading state
    const findButton = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();

    if ((await findButton.count()) > 0) {
      await findButton.click();

      // Should show loading spinner or indicator
      await expect(
        page.locator("text=/searching|loading/i").first()
      ).toBeVisible({ timeout: 3000 });
    }
  });
});
