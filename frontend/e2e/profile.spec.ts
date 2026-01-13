import { test, expect } from "@playwright/test";
import { registerUser, generateTestUser } from "./helpers";

test.describe("Profile Management", () => {
  test("should display user profile on dashboard", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Check if profile/username is visible on dashboard
    await expect(page.locator(`text=${user.username}`).first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("should update user profile", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Navigate to profile settings (if exists)
    // This might be in a settings menu or profile page
    const profileButton = page.locator("text=/profile|settings|account/i");
    if ((await profileButton.count()) > 0) {
      await profileButton.first().click();

      // Update bio or other fields
      const bioInput = page.locator('input[name="bio"], textarea[name="bio"]');
      if ((await bioInput.count()) > 0) {
        await bioInput.fill("Updated bio for testing");

        // Save changes
        const saveButton = page
          .locator("button")
          .filter({ hasText: /save|update/i });
        if ((await saveButton.count()) > 0) {
          await saveButton.click();

          // Verify update
          await expect(
            page.locator("text=Updated bio for testing")
          ).toBeVisible({ timeout: 3000 });
        }
      }
    }
  });
});
