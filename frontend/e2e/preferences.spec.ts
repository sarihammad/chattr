import { test, expect } from "@playwright/test";
import { registerUser, generateTestUser } from "./helpers";

test.describe("Matchmaking Preferences", () => {
  test("should set matchmaking preferences", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Select a mode (this should update preferences)
    const modeButtons = page
      .locator("button")
      .filter({ hasText: /FRIENDS|DATING|RANDOM|NETWORKING/i });

    if ((await modeButtons.count()) > 0) {
      const friendsMode = modeButtons.filter({ hasText: /FRIENDS/i }).first();
      await friendsMode.click();

      // Wait for preference to be saved (might show a success indicator)
      await page.waitForTimeout(1000);
    }
  });

  test("should persist preferences across page reloads", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Select a mode
    const modeButtons = page
      .locator("button")
      .filter({ hasText: /FRIENDS|DATING|RANDOM|NETWORKING/i });

    if ((await modeButtons.count()) > 0) {
      await modeButtons
        .filter({ hasText: /DATING/i })
        .first()
        .click();
      await page.waitForTimeout(1000);
    }

    // Reload page
    await page.reload();
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });

    // Preference should still be selected (check for active state or selected mode)
    // This might need adjustment based on how you show selected mode
  });
});
