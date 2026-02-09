# E2E Tests with Playwright

## System Requirements

Playwright E2E tests require system dependencies for Chromium.

### Installing Dependencies

On systems with sudo access, run:

```bash
npx playwright install-deps chromium
```

### Required Libraries (Debian/Ubuntu)

```bash
sudo apt-get install -y \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libpango-1.0-0 \
  libcairo2 \
  libasound2
```

## Test User Setup

**IMPORTANT:** Before running E2E tests, you must create a test user in your database.

### Option 1: Via the UI (Recommended)

1. Start the dev server: `npm run dev`
2. Navigate to http://localhost:3000/register
3. Create an account with these credentials:
   - **Email:** test@example.com
   - **Password:** TestPassword123!
   - **Name:** Test User
   - Check the age verification checkbox

### Option 2: Via MongoDB

Connect to your MongoDB database and insert:

```javascript
db.users.insertOne({
  email: "test@example.com",
  name: "Test User",
  passwordHash: "$2a$12$YOUR_BCRYPT_HASH_HERE", // Hash of "TestPassword123!"
  provider: "credentials",
  ageVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});
```

## Running Tests

Once dependencies are installed:

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test auth.spec.ts

# Run in headed mode (with visible browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug
```

## Test Structure

- `setup/global.setup.ts` - Prepares test environment
- `setup/auth.setup.ts` - Creates authenticated session (storageState)
- `*.spec.ts` - Individual test suites

## Current Status

✅ Playwright configured
✅ Test files created
⚠️  System dependencies required for execution

Once dependencies are installed, all tests should pass.
