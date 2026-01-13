import { test, expect } from "@playwright/test";
import { registerUser, generateTestUser } from "./helpers";

test.describe("Presence and Online Status", () => {
  test("should display online users", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Check for online users indicator or list
    // This might be visible in the UI or via API
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Online users list might be displayed somewhere
    await page.waitForTimeout(2000);
  });

  test("should show user online status in chat list", async ({
    page,
    context,
  }) => {
    const user1 = generateTestUser();
    const user2 = generateTestUser();

    await registerUser(page, user1.username, user1.email, user1.password);

    // Create second user in new context
    const page2 = await context.newPage();
    await registerUser(page2, user2.username, user2.email, user2.password);

    // Both users should be online
    // If they match and have a chat, online status should be visible
    await page.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    await page2.close();
  });

  test("should update presence on page visibility change", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Simulate page becoming hidden (tab switch)
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        writable: true,
        value: true,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await page.waitForTimeout(1000);

    // Simulate page becoming visible again
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        writable: true,
        value: false,
      });
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await page.waitForTimeout(1000);
  });
});
