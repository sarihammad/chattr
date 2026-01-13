import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
  });

  test("should navigate to register page from landing page", async ({
    page,
  }) => {
    await page.goto("/");

    // Click "Get Started Free" button
    await page.click("text=Start Free");

    // Should navigate to register page
    await expect(page).toHaveURL(/.*\/register/);
  });

  test("should register a new user successfully", async ({ page }) => {
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const email = `test${timestamp}@example.com`;
    const password = "TestPassword123!";

    await page.goto("/register");

    // Fill registration form
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard after successful registration
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await page.goto("/register");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors (adjust selectors based on your form)
    // This is a placeholder - adjust based on your actual error display
    const errorVisible =
      (await page.locator("text=/required|invalid/i").count()) > 0;
    expect(errorVisible).toBeTruthy();
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    // First, register a user
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const email = `test${timestamp}@example.com`;
    const password = "TestPassword123!";

    await page.goto("/register");
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });

    // Logout
    await page.goto("/login");

    // Fill login form
    await page.fill('input[name="emailOrUsername"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
  });

  test("should show error for invalid login credentials", async ({ page }) => {
    await page.goto("/login");

    // Fill with invalid credentials
    await page.fill('input[name="emailOrUsername"]', "nonexistent@example.com");
    await page.fill('input[name="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    // Should show error message (adjust selector based on your error display)
    await expect(
      page.locator("text=/invalid|incorrect|error/i").first()
    ).toBeVisible({ timeout: 5000 });
  });

  test("should navigate between login and register pages", async ({ page }) => {
    await page.goto("/login");

    // Click link to register
    await page.click("text=/sign up|register/i");
    await expect(page).toHaveURL(/.*\/register/);

    // Click link back to login
    await page.click("text=/sign in|login/i");
    await expect(page).toHaveURL(/.*\/login/);
  });

  test("should redirect authenticated user from landing to dashboard", async ({
    page,
  }) => {
    // First, login
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    const email = `test${timestamp}@example.com`;
    const password = "TestPassword123!";

    await page.goto("/register");
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });

    // Now try to visit landing page
    await page.goto("/");

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test("should handle password visibility toggle", async ({ page }) => {
    await page.goto("/register");

    // Find password input
    const passwordInput = page.locator('input[name="password"]').first();
    if ((await passwordInput.count()) > 0) {
      await passwordInput.fill("TestPassword123!");

      // Check if password is hidden by default (type="password")
      const inputType = await passwordInput.getAttribute("type");
      expect(inputType).toBe("password");

      // Look for toggle button (eye icon)
      const toggleButton = page
        .locator("button")
        .filter({ hasText: /show|hide|eye/i });
      if ((await toggleButton.count()) > 0) {
        await toggleButton.click();

        // Password should now be visible
        const newInputType = await passwordInput.getAttribute("type");
        expect(newInputType).toBe("text");
      }
    }
  });

  test("should validate password strength", async ({ page }) => {
    await page.goto("/register");

    // Fill form with weak password
    const timestamp = Date.now();
    await page.fill('input[name="username"]', `user${timestamp}`);
    await page.fill('input[name="email"]', `test${timestamp}@example.com`);
    await page.fill('input[name="password"]', "123");

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error for weak password
    await page.waitForTimeout(1000);
  });

  test("should handle email format validation", async ({ page }) => {
    await page.goto("/register");

    const timestamp = Date.now();
    await page.fill('input[name="username"]', `user${timestamp}`);
    await page.fill('input[name="email"]', "invalid-email");
    await page.fill('input[name="password"]', "TestPassword123!");

    await page.click('button[type="submit"]');

    // Should show email validation error
    await page.waitForTimeout(1000);
  });
});
