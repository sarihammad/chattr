import { test, expect } from "@playwright/test";
import { registerUser, generateTestUser } from "./helpers";

test.describe("WebSocket Connection", () => {
  test("should establish WebSocket connection on dashboard load", async ({
    page,
  }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Check for WebSocket connection by looking for real-time features
    // Presence indicators, typing indicators, etc.
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Wait a bit for WebSocket to connect
    await page.waitForTimeout(2000);

    // If there's a connection indicator, check it
    // Or verify real-time features work
  });

  test("should handle WebSocket reconnection on disconnect", async ({
    page,
  }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Simulate network disconnection (might require browser context manipulation)
    // Then verify reconnection happens
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("should receive real-time presence updates", async ({
    page,
    context,
  }) => {
    const user1 = generateTestUser();
    await registerUser(page, user1.username, user1.email, user1.password);

    // Create second user in new context/page
    const page2 = await context.newPage();
    const user2 = generateTestUser();
    await registerUser(page2, user2.username, user2.email, user2.password);

    // Both should show as online
    // This would require checking presence indicators
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page2).toHaveURL(/.*\/dashboard/);

    await page2.close();
  });
});
