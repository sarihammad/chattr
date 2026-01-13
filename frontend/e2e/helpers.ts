import { Page } from "@playwright/test";

/**
 * Helper functions for E2E tests
 */

export async function registerUser(
  page: Page,
  username: string,
  email: string,
  password: string = "TestPassword123!"
) {
  await page.goto("/register");
  await page.fill('input[name="username"]', username);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard
  await page.waitForURL(/.*\/dashboard/, { timeout: 10000 });
}

export async function loginUser(
  page: Page,
  emailOrUsername: string,
  password: string = "TestPassword123!"
) {
  await page.goto("/login");
  await page.fill('input[name="emailOrUsername"]', emailOrUsername);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard
  await page.waitForURL(/.*\/dashboard/, { timeout: 10000 });
}

export async function clearAuth(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export function generateTestUser(timestamp?: number) {
  const ts = timestamp || Date.now();
  return {
    username: `testuser_${ts}`,
    email: `test_${ts}@example.com`,
    password: "TestPassword123!",
  };
}

export async function waitForMatchmakingStatus(
  page: Page,
  status: "SEARCHING" | "MATCHED" | "IDLE",
  timeout: number = 10000
) {
  await page.waitForFunction(
    (expectedStatus) => {
      const statusText = document.body.textContent || "";
      return statusText.includes(expectedStatus);
    },
    status,
    { timeout }
  );
}

export async function waitForWebSocketConnection(page: Page) {
  // Wait for WebSocket connection to be established
  // This is a simplified check - adjust based on your WebSocket implementation
  await page.waitForTimeout(2000);
}
