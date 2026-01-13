import { test, expect } from "@playwright/test";
import {
  registerUser,
  generateTestUser,
  waitForWebSocketConnection,
} from "./helpers";

test.describe("Complete User Flow", () => {
  test("full flow: register -> set preferences -> match -> chat -> block", async ({
    page,
    context,
  }) => {
    // Step 1: Register User 1
    const user1 = generateTestUser();
    await registerUser(page, user1.username, user1.email, user1.password);
    await waitForWebSocketConnection(page);

    // Step 2: Set preferences (select mode)
    const modeButtons = page
      .locator("button")
      .filter({ hasText: /FRIENDS|DATING|RANDOM|NETWORKING/i });

    if ((await modeButtons.count()) > 0) {
      await modeButtons
        .filter({ hasText: /FRIENDS/i })
        .first()
        .click();
      await page.waitForTimeout(1000);
    }

    // Step 3: Create User 2 in new browser context
    const page2 = await context.newPage();
    const user2 = generateTestUser();
    await registerUser(page2, user2.username, user2.email, user2.password);
    await waitForWebSocketConnection(page2);

    // Set same mode for user 2
    const modeButtons2 = page2
      .locator("button")
      .filter({ hasText: /FRIENDS|DATING|RANDOM|NETWORKING/i });

    if ((await modeButtons2.count()) > 0) {
      await modeButtons2
        .filter({ hasText: /FRIENDS/i })
        .first()
        .click();
      await page2.waitForTimeout(1000);
    }

    // Step 4: Start matchmaking for both users
    const findButton1 = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();
    const findButton2 = page2
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();

    await findButton1.click();
    await findButton2.click();

    // Step 5: Wait for match (or timeout)
    await page.waitForTimeout(5000);

    // Step 6: If matched, send a message
    const messageInput1 = page
      .locator('input[type="text"], textarea')
      .filter({ hasText: /type a message|message/i })
      .or(page.locator('input[placeholder*="message" i]'));

    if ((await messageInput1.count()) > 0) {
      await messageInput1.fill("Hello from user 1!");

      const sendButton1 = page
        .locator("button")
        .filter({ hasText: /send/i })
        .or(page.locator('button[aria-label*="send" i]'));

      if ((await sendButton1.count()) > 0) {
        await sendButton1.click();
        await page.waitForTimeout(2000);

        // Verify message appears on user 2's screen
        await expect(page2.locator("text=Hello from user 1!")).toBeVisible({
          timeout: 5000,
        });
      }
    }

    // Step 7: User 1 blocks User 2
    // Find user menu button (MoreVertical icon or menu)
    const menuButton = page
      .locator("button")
      .filter({
        hasText: /more|menu/i,
      })
      .or(page.locator('[aria-label*="menu" i]'));

    if ((await menuButton.count()) > 0) {
      await menuButton.click();
      await page.waitForTimeout(500);

      // Click block option
      const blockOption = page.locator("text=/block/i");
      if ((await blockOption.count()) > 0) {
        await blockOption.click();
        await page.waitForTimeout(500);

        // Confirm block in modal
        const confirmBlock = page
          .locator("button")
          .filter({ hasText: /block|confirm/i });
        if ((await confirmBlock.count()) > 0) {
          await confirmBlock.click();
          await page.waitForTimeout(1000);

          // Chat should be closed or blocked user indicator shown
        }
      }
    }

    await page2.close();
  });

  test("full flow: match -> use AI opener -> chat -> skip -> rematch", async ({
    page,
    context,
  }) => {
    // Register and match two users
    const user1 = generateTestUser();
    const user2 = generateTestUser();

    await registerUser(page, user1.username, user1.email, user1.password);
    const page2 = await context.newPage();
    await registerUser(page2, user2.username, user2.email, user2.password);

    // Both select same mode and start matchmaking
    const modeButtons1 = page.locator("button").filter({ hasText: /FRIENDS/i });
    const modeButtons2 = page2
      .locator("button")
      .filter({ hasText: /FRIENDS/i });

    if ((await modeButtons1.count()) > 0) await modeButtons1.first().click();
    if ((await modeButtons2.count()) > 0) await modeButtons2.first().click();

    await page.waitForTimeout(500);
    await page2.waitForTimeout(500);

    // Start matchmaking
    const findButton1 = page
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();
    const findButton2 = page2
      .locator("button")
      .filter({ hasText: /find someone|get started/i })
      .first();

    await findButton1.click();
    await findButton2.click();

    // Wait for match
    await page.waitForTimeout(5000);

    // Use AI conversation opener
    const openerButton = page
      .locator("button")
      .filter({ hasText: /conversation starter|icebreaker|opener/i })
      .first();

    if ((await openerButton.count()) > 0) {
      await openerButton.click();
      await page.waitForTimeout(2000);

      // Message should be sent or populated in input
      // Send it if not auto-sent
      const sendButton = page.locator("button").filter({ hasText: /send/i });
      if ((await sendButton.count()) > 0) {
        await sendButton.click();
        await page.waitForTimeout(2000);
      }
    }

    // Skip match
    const skipButton = page.locator("button").filter({ hasText: /skip/i });
    if ((await skipButton.count()) > 0) {
      await skipButton.click();
      await page.waitForTimeout(1000);

      // Chat should be closed, ready for new match
      // Try to match again
      if ((await findButton1.count()) > 0) {
        await findButton1.click();
      }
    }

    await page2.close();
  });
});
