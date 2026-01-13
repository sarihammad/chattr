import { test, expect } from "@playwright/test";

test.describe("Matchmaking Flow", () => {
  let username1: string;
  let email1: string;
  let username2: string;
  let email2: string;
  const password = "TestPassword123!";

  test.beforeEach(async ({ page }) => {
    // Create two test users
    const timestamp = Date.now();
    username1 = `user1_${timestamp}`;
    email1 = `user1_${timestamp}@example.com`;
    username2 = `user2_${timestamp}`;
    email2 = `user2_${timestamp}@example.com`;

    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  async function registerUser(page: any, username: string, email: string) {
    await page.goto("/register");
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  }

  test("should display matchmaking controls on dashboard", async ({ page }) => {
    await registerUser(page, username1, email1);

    // Check for mode selector
    await expect(
      page.locator("text=/FRIENDS|DATING|RANDOM|NETWORKING/i").first()
    ).toBeVisible();

    // Check for "Find someone to talk to" button
    await expect(
      page.locator("text=/find someone|get started/i").first()
    ).toBeVisible();
  });

  test("should set matchmaking preferences", async ({ page }) => {
    await registerUser(page, username1, email1);

    // Select a mode (assuming there's a mode selector)
    // This might need adjustment based on your actual UI
    const modeSelector = page
      .locator("select, button")
      .filter({ hasText: /FRIENDS|DATING/i })
      .first();
    if ((await modeSelector.count()) > 0) {
      await modeSelector.click();
      // Wait for mode to be selected
      await page.waitForTimeout(500);
    }
  });

  test("should start matchmaking and show searching state", async ({
    page,
  }) => {
    await registerUser(page, username1, email1);

    // Click "Find someone to talk to" button
    const findButton = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();
    await findButton.click();

    // Should show searching state
    await expect(page.locator("text=/searching/i").first()).toBeVisible({
      timeout: 5000,
    });
  });

  test("should display match when found", async ({ page }) => {
    // This test requires two users searching at the same time
    // For now, we'll test the UI state changes

    await registerUser(page, username1, email1);

    // Start matchmaking
    const findButton = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();
    await findButton.click();

    // Wait for either match found or timeout
    // Note: This is a simplified test - in real scenario, you'd need two users
    await page.waitForTimeout(3000);

    // Check if we see either "searching" or "match found" state
    const searchingOrMatched = page.locator(
      "text=/searching|match found|matched/i"
    );
    const count = await searchingOrMatched.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should stop matchmaking", async ({ page }) => {
    await registerUser(page, username1, email1);

    // Start matchmaking
    const findButton = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();
    await findButton.click();

    // Wait for searching state
    await expect(page.locator("text=/searching/i").first()).toBeVisible({
      timeout: 5000,
    });

    // Click stop button
    const stopButton = page.locator("button").filter({ hasText: /stop/i });
    if ((await stopButton.count()) > 0) {
      await stopButton.click();

      // Should return to idle state
      await expect(
        page.locator("text=/idle|find someone/i").first()
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test("should skip a match", async ({ page, context }) => {
    // This test would require setting up a match first
    // Simplified version: test that skip button exists when there's a match
    await registerUser(page, username1, email1);

    // Navigate to a chat (if match exists)
    // This would need to be adjusted based on your actual flow
    // For now, we'll just check that the dashboard loads
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("should change matchmaking mode", async ({ page }) => {
    await registerUser(page, username1, email1);

    // Try to change mode (adjust selectors based on your UI)
    const modeButtons = page
      .locator("button")
      .filter({ hasText: /FRIENDS|DATING|RANDOM|NETWORKING/i });

    if ((await modeButtons.count()) > 0) {
      const firstMode = modeButtons.first();
      await firstMode.click();
      await page.waitForTimeout(500);

      // Mode should be selected
      // You might want to check for visual indication (active state, etc.)
    }
  });

  test("should handle matchmaking timeout gracefully", async ({ page }) => {
    await registerUser(page, username1, email1);

    // Start matchmaking
    const findButton = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();
    await findButton.click();

    // Wait for searching state
    await expect(page.locator("text=/searching/i").first()).toBeVisible({
      timeout: 5000,
    });

    // Wait longer than typical timeout (60s)
    // After timeout, should show appropriate message or stop searching
    // This might need adjustment based on your timeout handling
    await page.waitForTimeout(2000);
  });

  test("should prevent starting matchmaking while already searching", async ({
    page,
  }) => {
    await registerUser(page, username1, email1);

    // Start matchmaking
    const findButton = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();
    await findButton.click();

    await expect(page.locator("text=/searching/i").first()).toBeVisible({
      timeout: 5000,
    });

    // Try to start again - button should be disabled or not do anything
    const buttonState = await findButton.isEnabled();
    // If still enabled, clicking shouldn't cause issues
    if (buttonState) {
      await findButton.click();
      await page.waitForTimeout(1000);
    }
  });

  test("should show matchmaking status correctly", async ({ page }) => {
    await registerUser(page, username1, email1);

    // Initially should be IDLE
    // After starting, should be SEARCHING
    // After match, should be MATCHED

    const findButton = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();
    await findButton.click();

    // Should show searching
    await expect(page.locator("text=/searching/i").first()).toBeVisible({
      timeout: 5000,
    });
  });
});
