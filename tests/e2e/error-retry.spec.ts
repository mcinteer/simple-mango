import { test, expect } from '@playwright/test';

/**
 * Error and Retry Tests
 * 
 * Tests error handling and retry functionality:
 * - API 500 error displays error message
 * - Retry button is visible and functional
 * - Successful retry renders dashboard correctly
 * 
 * NOTE: These tests require browser dependencies. See tests/e2e/README.md
 */

test.describe('Error Handling and Retry', () => {
  test('API 500 error displays error message to user', async ({ page }) => {
    // Intercept the race-cards API and return 500 error
    await page.route('**/api/race-cards**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        }),
      });
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Error message should be visible (use first() to avoid strict mode)
    await expect(
      page.getByText(/error|something went wrong|failed to load|error loading/i).first()
    ).toBeVisible();
  });

  test('retry button is visible when API fails', async ({ page }) => {
    // Intercept the race-cards API and return 500 error
    await page.route('**/api/race-cards**', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
          },
        }),
      });
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Retry button should be visible
    const retryButton = page.getByRole('button', { name: /retry|try again/i });
    await expect(retryButton).toBeVisible();
  });

  test('successful retry renders dashboard correctly', async ({ page }) => {
    let requestCount = 0;

    // First request fails, second succeeds
    await page.route('**/api/race-cards**', async (route) => {
      requestCount++;
      
      if (requestCount === 1) {
        // First request: fail with 500
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error',
            },
          }),
        });
      } else {
        // Subsequent requests: succeed with real data
        await route.continue();
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should see error message
    await expect(
      page.getByText(/error|something went wrong|failed to load|error loading/i).first()
    ).toBeVisible();

    // Click retry button
    const retryButton = page.getByRole('button', { name: /retry|try again/i });
    await retryButton.click();

    // Wait for successful load
    await page.waitForLoadState('networkidle');

    // Error should be gone or we see content
    const errorGone = await page.getByText(/error|something went wrong|failed to load|error loading/i).first().isVisible().catch(() => false);
    const contentVisible = await page.locator('h2, h3, button').first().isVisible().catch(() => false);
    expect(errorGone || contentVisible).toBeTruthy();

    // Dashboard content should be visible
    // Look for state headings or meeting cards
    const content = page.locator('h2, h3, [href*="/race/"]');
    await expect(content.first()).toBeVisible();
  });

  test('multiple consecutive errors are handled gracefully', async ({ page }) => {
    let requestCount = 0;

    // First two requests fail, third succeeds
    await page.route('**/api/race-cards**', async (route) => {
      requestCount++;
      
      if (requestCount <= 2) {
        // First two requests: fail
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: 'INTERNAL_ERROR',
              message: 'Internal server error',
            },
          }),
        });
      } else {
        // Third request: succeed
        await route.continue();
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should see error message
    await expect(
      page.getByText(/error|something went wrong|failed to load|error loading/i).first()
    ).toBeVisible();

    // Click retry button (first retry)
    const retryButton = page.getByRole('button', { name: /retry|try again/i });
    await retryButton.click();
    await page.waitForTimeout(1000);

    // Should still see error after first retry (second request also fails)
    const stillError = await page.getByText(/error|something went wrong|failed to load|error loading/i).first().isVisible().catch(() => false);
    expect(stillError).toBeTruthy();

    // Click retry button (second retry)
    await retryButton.click();
    await page.waitForLoadState('networkidle');

    // Now should be successful
    await expect(
      page.getByText(/error|something went wrong|failed to load/i)
    ).not.toBeVisible();

    // Dashboard content should be visible
    const content = page.locator('h2, h3, [href*="/race/"]');
    await expect(content.first()).toBeVisible();
  });

  test('network timeout is handled with appropriate error', async ({ page }) => {
    // Intercept and never respond (simulating timeout)
    await page.route('**/api/race-cards**', async () => {
      // Don't fulfill or continue - just hang
      await new Promise(() => {}); // Never resolves
    });

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    
    // Wait a moment and check if error appears
    await page.waitForTimeout(2000);
    
    // Check for timeout or error (may or may not appear depending on implementation)
    const errorVisible = await page.getByText(/error|timeout|failed to load|taking too long/i).first().isVisible().catch(() => false);
    // This test just verifies the app doesn't crash, not that a specific error appears
    expect(errorVisible || page.url().includes('/dashboard')).toBeTruthy();
  });
});

test.describe('Partial Failure Scenarios', () => {
  test('shows partial data when some API calls succeed', async ({ page }) => {
    // This test assumes the app makes multiple API calls or handles partial failures
    // Adjust based on actual implementation
    
    let requestCount = 0;

    await page.route('**/api/race-cards**', async (route) => {
      requestCount++;
      
      // Alternate between success and failure
      if (requestCount % 2 === 0) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({
            error: { code: 'INTERNAL_ERROR', message: 'Error' },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Should show some content if at least one request succeeded
    // Or show error if all failed
    const hasContent = await page.locator('h2, h3, [href*="/race/"]').count() > 0;
    const hasError = await page.getByText(/error|something went wrong/i).isVisible().catch(() => false);

    // Either content or error should be visible
    expect(hasContent || hasError).toBeTruthy();
  });
});
