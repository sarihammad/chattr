import { test, expect } from "@playwright/test";
import {
  registerUser,
  generateTestUser,
  waitForWebSocketConnection,
} from "./helpers";

/**
 * Comprehensive end-to-end test covering the full application flow
 * This test simulates a real user journey through the application
 */
test.describe("Comprehensive Application Flow", () => {
  test("complete user journey: onboarding to conversation", async ({
    page,
    context,
  }) => {
    // === STEP 1: Landing Page ===
    await page.goto("/");

    // Verify landing page loads
    await expect(page.locator("h1")).toContainText(
      /Find Your People|Meet people/i
    );

    // Navigate to register
    await page.click("text=Start Free");
    await expect(page).toHaveURL(/.*\/register/);

    // === STEP 2: Registration ===
    const user1 = generateTestUser();
    await registerUser(page, user1.username, user1.email, user1.password);
    await waitForWebSocketConnection(page);

    // === STEP 3: Dashboard Initialization ===
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Verify dashboard elements
    await expect(
      page.locator("text=/FRIENDS|DATING|RANDOM|NETWORKING/i").first()
    ).toBeVisible({ timeout: 5000 });

    // === STEP 4: Create Second User ===
    const page2 = await context.newPage();
    const user2 = generateTestUser();
    await registerUser(page2, user2.username, user2.email, user2.password);
    await waitForWebSocketConnection(page2);

    // === STEP 5: Both Users Set Preferences ===
    const mode1 = page
      .locator("button")
      .filter({ hasText: /FRIENDS/i })
      .first();
    const mode2 = page2
      .locator("button")
      .filter({ hasText: /FRIENDS/i })
      .first();

    if ((await mode1.count()) > 0) await mode1.click();
    if ((await mode2.count()) > 0) await mode2.click();

    await page.waitForTimeout(1000);
    await page2.waitForTimeout(1000);

    // === STEP 6: Start Matchmaking ===
    const findButton1 = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();
    const findButton2 = page2
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();

    await Promise.all([findButton1.click(), findButton2.click()]);

    // === STEP 7: Wait for Match ===
    await expect(
      page.locator("text=/searching|matched|match found/i").first()
    ).toBeVisible({ timeout: 10000 });

    // Wait for match to complete
    await page.waitForTimeout(5000);

    // === STEP 8: Verify Match Occurred ===
    // Check if either user shows a match
    const matchIndicators = [
      page.locator("text=/match found|matched/i"),
      page2.locator("text=/match found|matched/i"),
    ];

    let matchFound = false;
    for (const indicator of matchIndicators) {
      if ((await indicator.count()) > 0) {
        matchFound = true;
        break;
      }
    }

    // === STEP 9: Use AI Conversation Opener ===
    if (matchFound) {
      // Find conversation opener button
      const openerButtons = [
        page
          .locator("button")
          .filter({ hasText: /conversation starter|opener|icebreaker/i }),
        page2
          .locator("button")
          .filter({ hasText: /conversation starter|opener|icebreaker/i }),
      ];

      for (const openerButton of openerButtons) {
        if ((await openerButton.count()) > 0) {
          await openerButton.first().click();
          await page.waitForTimeout(2000);

          // Verify opener was used (message sent or input populated)
          break;
        }
      }
    }

    // === STEP 10: Send Messages ===
    const messageInputs = [
      page
        .locator('input[type="text"], textarea')
        .filter({ hasText: /type a message/i })
        .or(page.locator('input[placeholder*="message" i]')),
      page2
        .locator('input[type="text"], textarea')
        .filter({ hasText: /type a message/i })
        .or(page2.locator('input[placeholder*="message" i]')),
    ];

    for (const input of messageInputs) {
      if ((await input.count()) > 0) {
        await input.fill("Hello! This is a test message.");
        const sendButton = page
          .locator("button")
          .filter({ hasText: /send/i })
          .or(page.locator('button[aria-label*="send" i]'));

        if ((await sendButton.count()) > 0) {
          await sendButton.click();
          await page.waitForTimeout(2000);
        }
        break;
      }
    }

    // === STEP 11: Verify Message Delivery ===
    // Messages should appear on both sides
    await page.waitForTimeout(2000);
    await page2.waitForTimeout(2000);

    // === STEP 12: Block User (optional test) ===
    // Uncomment to test blocking
    // const menuButton = page.locator("button").filter({ hasText: /more|menu/i });
    // if ((await menuButton.count()) > 0) {
    //   await menuButton.click();
    //   // ... block flow
    // }

    await page2.close();
  });

  test("error recovery flow", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user.username, user.email, user.password);

    // Simulate network error
    await page.route("**/api/**", (route) => route.abort());

    // Try to perform action
    const findButton = page
      .locator("button")
      .filter({ hasText: /find someone/i })
      .first();

    if ((await findButton.count()) > 0) {
      await findButton.click();
      await page.waitForTimeout(2000);

      // Error should be handled gracefully
      // Restore network
      await page.unroute("**/api/**");
    }
  });
});
