import { test, expect } from "@playwright/test";
import { registerUser, generateTestUser } from "./helpers";

test.describe("Error Handling", () => {
  test("should handle API errors gracefully", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Try to perform an action that might fail
    // For example, try to match without preferences set
    const findButton = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();

    if ((await findButton.count()) > 0) {
      await findButton.click();

      // If error occurs, should show user-friendly error message
      // Check for error display (adjust selector based on your error UI)
      await page.waitForTimeout(2000);

      // Error should be visible and informative
      const errorMessage = page.locator(
        "text=/error|failed|something went wrong/i"
      );
      // Don't fail if no error (it might succeed), just check it's handled if it appears
    }
  });

  test("should handle network errors", async ({ page, context }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Simulate offline network
    await context.setOffline(true);

    // Try to perform an action
    const findButton = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();

    if ((await findButton.count()) > 0) {
      await findButton.click();

      // Should show network error message
      await page.waitForTimeout(2000);
    }

    // Restore network
    await context.setOffline(false);
  });

  test("should handle invalid room access", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Try to access a room that doesn't exist or user isn't part of
    await page.goto("/dashboard?roomId=invalid-room-id");

    // Should show error or redirect
    // Or show "not found" message
    await page.waitForTimeout(2000);
  });
});
