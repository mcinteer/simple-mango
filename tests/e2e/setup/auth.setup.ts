import { test as setup } from '@playwright/test';

/**
 * Authentication setup
 * 
 * This test logs in with test credentials and saves the authenticated state
 * to tests/e2e/.auth/user.json for use by all other tests.
 * 
 * REQUIREMENTS:
 * - Chromium system dependencies (run: npx playwright install-deps chromium) ✓
 * - Test user must exist in database (test@example.com / TestPassword123!)
 * 
 * If the test user doesn't exist, the global.setup.ts will attempt to create it.
 */
setup('authenticate', async ({ page }) => {
  const authFile = './tests/e2e/.auth/user.json';
  const TEST_USER = {
    email: 'test@example.com',
    password: 'TestPassword123!',
  };

  console.log(`Attempting login with: ${TEST_USER.email}`);

  // Listen for ALL API requests and responses
  page.on('request', request => {
    const url = request.url();
    if (url.includes('/api/auth/callback/credentials') || url.includes('/api/auth/signin')) {
      console.log(`API Request: ${request.method()} ${url}`);
    }
  });
  
  page.on('response', async (response) => {
    const url = response.url();
    if (url.includes('/api/auth')) {
      console.log(`API Response: ${url} - Status: ${response.status()}`);
      
      // Special attention to callback/credentials
      if (url.includes('callback/credentials')) {
        try {
          const body = await response.text();
          console.log(`Credentials callback response: ${body.substring(0, 500)}`);
        } catch {
          console.log('Could not read credentials callback body');
        }
      }
    }
  });

  // Navigate to login page
  await page.goto('/login');

  // Fill in credentials
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);

  console.log('Submitting login form...');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Wait a moment for the form to submit
  await page.waitForTimeout(3000);

  // Wait for either dashboard or error
  try {
    await page.waitForURL('/dashboard', { timeout: 15000 });
  } catch {
    // Get full page content for debugging
    const pageContent = await page.content();
    
    // Check if there's an error message
    const errorText = await page.locator('text=/error|invalid|failed/i').textContent().catch(() => null);
    if (errorText) {
      // Also check server logs
      console.log('\n=== Page HTML (last 500 chars) ===');
      console.log(pageContent.slice(-500));
      throw new Error(`Login failed with error: ${errorText}\nEmail: ${TEST_USER.email}`);
    }
    
    // Check current URL
    const currentUrl = page.url();
    throw new Error(`Login did not redirect to dashboard. Current URL: ${currentUrl}\nEmail: ${TEST_USER.email}`);
  }

  // Save authenticated state
  await page.context().storageState({ path: authFile });
  
  console.log('✓ Authentication successful, storageState saved');
});
