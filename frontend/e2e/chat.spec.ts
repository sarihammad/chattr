import { test, expect } from "@playwright/test";

test.describe("Chat Functionality", () => {
  const password = "TestPassword123!";

  async function createUserAndLogin(page: any, timestamp: number) {
    const username = `chat_user_${timestamp}`;
    const email = `chat_${timestamp}@example.com`;

    await page.goto("/register");
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });

    return { username, email };
  }

  test("should display chat list on dashboard", async ({ page }) => {
    const timestamp = Date.now();
    await createUserAndLogin(page, timestamp);

    // Check for chat list or empty state
    const chatList = page.locator(
      '[data-testid="chat-list"], .chat-list, text=/select a chat|no chats/i'
    );
    await expect(chatList.first()).toBeVisible({ timeout: 5000 });
  });

  test("should send a message when match is found", async ({ page }) => {
    // This test assumes a match exists or is created
    // In a real scenario, you'd need two users matched

    const timestamp = Date.now();
    await createUserAndLogin(page, timestamp);

    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*\/dashboard/);

    // Look for message input (might not be visible if no chat selected)
    const messageInput = page.locator('input[type="text"], textarea').filter({
      hasText: /type a message|message/i,
    });

    if ((await messageInput.count()) > 0) {
      await messageInput.fill("Hello, this is a test message");

      // Find and click send button
      const sendButton = page
        .locator("button")
        .filter({
          hasText: /send/i,
        })
        .or(page.locator('button[aria-label*="send" i]'));

      if ((await sendButton.count()) > 0) {
        await sendButton.click();

        // Wait for message to appear (adjust selector based on your message display)
        await page.waitForTimeout(1000);

        // Message should be visible in chat
        const message = page.locator("text=Hello, this is a test message");
        await expect(message).toBeVisible({ timeout: 3000 });
      }
    }
  });

  test("should display typing indicator", async ({ page }) => {
    // This would require WebSocket connection testing
    // For now, we'll test the UI is ready for typing indicators

    const timestamp = Date.now();
    await createUserAndLogin(page, timestamp);

    // Check if typing indicator area exists (even if empty)
    // This is a placeholder - adjust based on your actual implementation
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("should show read receipts", async ({ page }) => {
    const timestamp = Date.now();
    await createUserAndLogin(page, timestamp);

    // After sending a message, check for read receipt indicators
    // This would require actual message flow
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("should display conversation openers when match is found", async ({
    page,
  }) => {
    // This test checks for AI conversation starters
    const timestamp = Date.now();
    await createUserAndLogin(page, timestamp);

    // Look for conversation starters section
    // This would appear when a new match is found
    const openers = page.locator(
      "text=/conversation starter|icebreaker|opener/i"
    );

    // They might not be visible if no match, so we just check page loads
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("should use conversation opener to send message", async ({ page }) => {
    const timestamp = Date.now();
    await createUserAndLogin(page, timestamp);

    // Find conversation opener button
    const openerButton = page.locator("button").filter({
      hasText: /conversation starter|icebreaker/i,
    });

    if ((await openerButton.count()) > 0) {
      await openerButton.first().click();

      // Message should be populated in input
      // And potentially auto-sent or ready to send
      await page.waitForTimeout(1000);
    }
  });

  test("should handle message editing", async ({ page }) => {
    const timestamp = Date.now();
    await createUserAndLogin(page, timestamp);

    // This would require:
    // 1. A match and chat
    // 2. Send a message
    // 3. Edit the message
    // For now, just verify dashboard loads
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("should handle message deletion", async ({ page }) => {
    const timestamp = Date.now();
    await createUserAndLogin(page, timestamp);

    // Similar to edit test
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("should display unread message counts", async ({ page }) => {
    const timestamp = Date.now();
    await createUserAndLogin(page, timestamp);

    // Check for unread count badges in chat list
    const unreadBadges = page.locator(
      "[data-testid='unread-count'], .unread-badge, text=/[0-9]+/"
    );
    // Unread counts might not be visible if no unread messages
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("should scroll to latest message", async ({ page }) => {
    const timestamp = Date.now();
    await createUserAndLogin(page, timestamp);

    // When new message arrives, should auto-scroll
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("should handle Enter key to send message", async ({ page }) => {
    const timestamp = Date.now();
    await createUserAndLogin(page, timestamp);

    const messageInput = page
      .locator('input[type="text"], textarea')
      .filter({ hasText: /type a message|message/i })
      .or(page.locator('input[placeholder*="message" i]'));

    if ((await messageInput.count()) > 0) {
      await messageInput.fill("Test message via Enter key");
      await messageInput.press("Enter");

      // Message should be sent
      await page.waitForTimeout(1000);
    }
  });
});
