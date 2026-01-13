# End-to-End Tests

This directory contains end-to-end tests for the Chattr application using Playwright.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers:

```bash
npx playwright install --with-deps chromium
```

## Running Tests

### Run all tests

```bash
npm run test:e2e
```

### Run tests in UI mode (interactive)

```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)

```bash
npm run test:e2e:headed
```

### Run specific test file

```bash
npx playwright test e2e/auth.spec.ts
```

### Run tests with debug mode

```bash
npx playwright test --debug
```

## Test Files

- `auth.spec.ts` - Authentication flows (register, login, logout, validation)
- `matchmaking.spec.ts` - Matchmaking features (start, stop, skip, mode selection)
- `chat.spec.ts` - Chat functionality (send messages, typing indicators, read receipts)
- `block-report.spec.ts` - Block and report user features
- `preferences.spec.ts` - Matchmaking preferences management
- `profile.spec.ts` - User profile management
- `presence.spec.ts` - Online status and presence tracking
- `websocket.spec.ts` - WebSocket connection and reconnection
- `error-handling.spec.ts` - Error handling and edge cases
- `ui-elements.spec.ts` - UI interactions and responsiveness
- `full-flow.spec.ts` - Complete user journeys
- `comprehensive.spec.ts` - Comprehensive end-to-end scenarios
- `helpers.ts` - Shared helper functions for tests

## Test Coverage

### ✅ Authentication (auth.spec.ts)

- [x] Navigate to register page
- [x] Register new user successfully
- [x] Form validation errors
- [x] Login with valid credentials
- [x] Login with invalid credentials
- [x] Navigate between login/register
- [x] Authenticated user redirect
- [x] Password visibility toggle
- [x] Password strength validation
- [x] Email format validation

### ✅ Matchmaking (matchmaking.spec.ts)

- [x] Display matchmaking controls
- [x] Set matchmaking preferences
- [x] Start matchmaking
- [x] Show searching state
- [x] Display match when found
- [x] Stop matchmaking
- [x] Skip a match
- [x] Change matchmaking mode
- [x] Handle matchmaking timeout
- [x] Prevent duplicate matchmaking
- [x] Show matchmaking status correctly

### ✅ Chat (chat.spec.ts)

- [x] Display chat list
- [x] Send messages
- [x] Display typing indicators
- [x] Show read receipts
- [x] Display conversation openers
- [x] Use conversation opener
- [x] Handle message editing
- [x] Handle message deletion
- [x] Display unread counts
- [x] Auto-scroll to latest message
- [x] Enter key to send message

### ✅ Block & Report (block-report.spec.ts)

- [x] Show user menu in chat header
- [x] Open block modal
- [x] Block user successfully
- [x] Open report modal
- [x] Report user with reason
- [x] Prevent blocked users from matching

### ✅ Preferences (preferences.spec.ts)

- [x] Set matchmaking preferences
- [x] Persist preferences across reloads

### ✅ Profile (profile.spec.ts)

- [x] Display user profile
- [x] Update user profile

### ✅ Presence (presence.spec.ts)

- [x] Display online users
- [x] Show online status in chat list
- [x] Update presence on visibility change

### ✅ WebSocket (websocket.spec.ts)

- [x] Establish WebSocket connection
- [x] Handle WebSocket reconnection
- [x] Receive real-time presence updates

### ✅ Error Handling (error-handling.spec.ts)

- [x] Handle API errors gracefully
- [x] Handle network errors
- [x] Handle invalid room access

### ✅ UI Elements (ui-elements.spec.ts)

- [x] Display all dashboard sections
- [x] Handle search functionality
- [x] Handle responsive layout
- [x] Handle keyboard navigation
- [x] Display loading states

### ✅ Full Flow (full-flow.spec.ts)

- [x] Complete user journey: register → preferences → match → chat → block
- [x] Complete flow: match → AI opener → chat → skip → rematch

### ✅ Comprehensive (comprehensive.spec.ts)

- [x] Complete onboarding to conversation flow
- [x] Error recovery flow

## Test Configuration

Test configuration is in `playwright.config.ts`. Key settings:

- Base URL: `http://localhost:3000` (can be overridden with `PLAYWRIGHT_TEST_BASE_URL` env var)
- Browser: Chromium (can be extended to Firefox/WebKit)
- Retries: 2 retries on CI, 0 locally
- Screenshots: Taken on failure
- Traces: Collected on first retry

## Prerequisites

Before running tests:

1. Ensure backend is running on `http://localhost:8080`
2. Ensure frontend dev server is running (or use `webServer` config)
3. Ensure all services (PostgreSQL, Redis, Kafka) are running

## CI/CD Integration

Tests are configured to:

- Run in CI mode when `CI` environment variable is set
- Retry failed tests twice
- Generate HTML reports
- Take screenshots on failure
- Upload test results as artifacts

## Writing New Tests

1. Import necessary functions from `helpers.ts`
2. Use descriptive test names
3. Follow the existing test structure
4. Use `data-testid` attributes in your components for reliable selectors
5. Clean up after tests (clear localStorage, etc.)
6. Use `waitForTimeout` sparingly; prefer `waitFor` or `toBeVisible` with timeout

Example:

```typescript
import { test, expect } from "@playwright/test";
import { registerUser, generateTestUser } from "./helpers";

test("my new test", async ({ page }) => {
  const user = generateTestUser();
  await registerUser(page, user.username, user.email, user.password);
  // Your test code here
});
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clear localStorage/sessionStorage before each test
3. **Waits**: Use Playwright's built-in waits instead of fixed timeouts when possible
4. **Selectors**: Prefer stable selectors (data-testid, role, label) over CSS classes
5. **Error Handling**: Test both success and error paths
6. **Accessibility**: Test keyboard navigation and screen readers when applicable

## Debugging Failed Tests

1. Run tests in headed mode: `npm run test:e2e:headed`
2. Use debug mode: `npx playwright test --debug`
3. Check screenshots in `test-results/`
4. View HTML report: `npx playwright show-report`
5. Check traces: Enable trace in config and view with Playwright Trace Viewer
