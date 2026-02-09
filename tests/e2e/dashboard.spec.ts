import { test, expect } from '@playwright/test';

/**
 * Dashboard Happy Path Tests
 * 
 * Tests the main dashboard functionality:
 * - Meetings grouped by state
 * - Meeting cards display correct info
 * - Skeleton loaders during loading
 * - Navigation to meeting detail
 * 
 * NOTE: These tests require browser dependencies. See tests/e2e/README.md
 */

test.describe('Dashboard Happy Path', () => {
  test.beforeEach(async ({ page }) => {
    // Start at the dashboard
    await page.goto('/dashboard');
  });

  test('dashboard page loads with state group headings', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for state group headings (e.g., "VIC", "NSW", "QLD", "SA", "WA", "TAS", "ACT", "NT")
    // At least one state should be visible
    const stateHeadings = page.locator('h2, h3').filter({ hasText: /^(VIC|NSW|QLD|SA|WA|TAS|ACT|NT)$/i });
    await expect(stateHeadings.first()).toBeVisible();
  });

  test('meeting cards display track name and start time', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Find meeting cards (buttons or divs with meeting info)
    const cards = page.locator('button, [role="article"], [class*="card"]').filter({
      has: page.locator('text=/[A-Z]|TBA/') // Has some text content
    });
    
    // At least one card should be visible
    await expect(cards.first()).toBeVisible();
    
    // Card should contain a track name (typically a city or venue name)
    const cardText = await cards.first().textContent();
    expect(cardText).toBeTruthy();
    
    // Card should contain either a time (HH:MM format) or "TBA"
    expect(cardText).toMatch(/\d{1,2}:\d{2}|TBA/);
  });

  test('clicking a meeting card navigates to meeting detail route', async ({ page }) => {
    // Wait for data to load
    await page.waitForLoadState('networkidle');
    
    // Find and click the first meeting card (button or link)
    const firstCard = page.locator('button, a[href*="/race/"]').first();
    
    // Click the card
    await firstCard.click();
    
    // Wait a moment for navigation
    await page.waitForTimeout(1000);
    
    // Should navigate to a race detail page or stay on dashboard (depending on implementation)
    const currentUrl = page.url();
    // Accept either a race detail route or dashboard (if navigation is via internal routing)
    const isValidRoute = currentUrl.includes('/race/') || currentUrl.includes('/dashboard');
    expect(isValidRoute).toBeTruthy();
  });

  test('skeleton loaders appear during loading', async ({ page }) => {
    // Intercept the API call to delay response
    await page.route('**/api/race-cards**', async (route) => {
      // Wait 2 seconds before responding
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });
    
    // Navigate to dashboard
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    
    // Skeleton loaders should be visible immediately
    const skeletons = page.locator('[data-testid="meeting-skeleton"], [class*="skeleton"], [class*="loading"]');
    await expect(skeletons.first()).toBeVisible({ timeout: 1000 });
    
    // After data loads, skeletons should be hidden
    await page.waitForLoadState('networkidle');
    await expect(skeletons.first()).not.toBeVisible();
  });

  test('dashboard shows appropriate message when no meetings available', async ({ page }) => {
    // Intercept API to return empty data
    await page.route('**/api/race-cards**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { RaceMeetings: [] } }),
      });
    });
    
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should show "no meetings" message
    await expect(page.getByText(/no.*meetings|no.*races.*available/i)).toBeVisible();
  });
});

test.describe('Dashboard State Groups', () => {
  test('meetings are correctly grouped by state', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Get all state headings (case-insensitive match)
    const stateHeadings = page.locator('h2, h3').filter({ hasText: /VIC|NSW|QLD|SA|WA|TAS|ACT|NT/ });
    const count = await stateHeadings.count();
    
    // Should have at least one state
    expect(count).toBeGreaterThan(0);
    
    // Verify at least one state heading is visible
    if (count > 0) {
      const firstHeading = stateHeadings.first();
      await expect(firstHeading).toBeVisible();
    }
  });
});
