import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global setup - prepares the test environment
 * 
 * IMPORTANT: This setup assumes the test user (test@example.com) already exists.
 * If the user doesn't exist, create it manually via /register before running tests.
 * See tests/e2e/README.md for instructions.
 */

setup('prepare test environment', async () => {
  const authDir = path.join(__dirname, '../.auth');
  
  // Ensure the .auth directory exists
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  console.log('✓ Test environment prepared');
  console.log('  NOTE: Test user (test@example.com) must exist in database');
  console.log('  See tests/e2e/README.md for setup instructions');
});
