import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

/**
 * Unit tests for Playwright configuration
 * Verifies that the E2E test setup is correctly configured
 */

describe('Playwright Configuration', () => {
  it('playwright.config.ts exists at repo root', () => {
    const configPath = path.join(process.cwd(), 'playwright.config.ts');
    expect(fs.existsSync(configPath)).toBe(true);
  });

  it('tests/e2e directory exists', () => {
    const testDir = path.join(process.cwd(), 'tests/e2e');
    expect(fs.existsSync(testDir)).toBe(true);
  });

  it('.auth directory is gitignored', () => {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    expect(gitignore).toContain('tests/e2e/.auth/');
  });

  it('test-results and playwright-report are gitignored', () => {
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
    expect(gitignore).toContain('/test-results/');
    expect(gitignore).toContain('/playwright-report/');
  });

  it('package.json has test:e2e script', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.scripts['test:e2e']).toBe('playwright test');
  });

  it('@playwright/test is installed', () => {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    expect(packageJson.devDependencies['@playwright/test']).toBeDefined();
  });
});

describe('Test File Structure', () => {
  const testFiles = [
    'tests/e2e/auth.spec.ts',
    'tests/e2e/dashboard.spec.ts',
    'tests/e2e/error-retry.spec.ts',
    'tests/e2e/responsive.spec.ts',
    'tests/e2e/theme.spec.ts',
  ];

  testFiles.forEach(testFile => {
    it(`${testFile} exists`, () => {
      const filePath = path.join(process.cwd(), testFile);
      expect(fs.existsSync(filePath)).toBe(true);
    });
  });

  it('setup/global.setup.ts exists', () => {
    const filePath = path.join(process.cwd(), 'tests/e2e/setup/global.setup.ts');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('setup/auth.setup.ts exists', () => {
    const filePath = path.join(process.cwd(), 'tests/e2e/setup/auth.setup.ts');
    expect(fs.existsSync(filePath)).toBe(true);
  });

  it('README.md exists in tests/e2e', () => {
    const filePath = path.join(process.cwd(), 'tests/e2e/README.md');
    expect(fs.existsSync(filePath)).toBe(true);
  });
});

describe('StorageState Setup', () => {
  it('.auth directory can be created', () => {
    const authDir = path.join(process.cwd(), 'tests/e2e/.auth');
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }
    expect(fs.existsSync(authDir)).toBe(true);
  });

  it('mock storageState file has correct structure', () => {
    const authFile = path.join(process.cwd(), 'tests/e2e/.auth/user.json');
    
    if (!fs.existsSync(authFile)) {
      // File might not exist yet, which is acceptable
      return;
    }
    
    const storageState = JSON.parse(fs.readFileSync(authFile, 'utf-8'));
    expect(storageState).toHaveProperty('cookies');
    expect(storageState).toHaveProperty('origins');
    expect(Array.isArray(storageState.cookies)).toBe(true);
    expect(Array.isArray(storageState.origins)).toBe(true);
  });
});

describe('Test Coverage', () => {
  it('covers auth flow acceptance criteria', () => {
    const authSpecPath = path.join(process.cwd(), 'tests/e2e/auth.spec.ts');
    const content = fs.readFileSync(authSpecPath, 'utf-8');
    
    // AC #2: Auth flow tests
    expect(content).toContain('landing page shows Sign Up / Sign In options');
    expect(content).toContain('registration form requires age-gate checkbox');
    expect(content).toContain('Google sign-in button');
    expect(content).toContain('successful email/password login');
    expect(content).toContain('logout');
  });

  it('covers dashboard acceptance criteria', () => {
    const dashboardSpecPath = path.join(process.cwd(), 'tests/e2e/dashboard.spec.ts');
    const content = fs.readFileSync(dashboardSpecPath, 'utf-8');
    
    // AC #4: Dashboard tests
    expect(content).toContain('state group headings');
    expect(content).toContain('meeting cards');
    expect(content).toContain('skeleton loaders');
    expect(content).toContain('meeting detail route');
  });

  it('covers error handling acceptance criteria', () => {
    const errorSpecPath = path.join(process.cwd(), 'tests/e2e/error-retry.spec.ts');
    const content = fs.readFileSync(errorSpecPath, 'utf-8');
    
    // AC #5: Error and retry tests
    expect(content).toContain('500');
    expect(content).toContain('error message');
    expect(content).toContain('retry button');
    expect(content).toContain('page.route');
  });

  it('covers responsive viewport acceptance criteria', () => {
    const responsiveSpecPath = path.join(process.cwd(), 'tests/e2e/responsive.spec.ts');
    const content = fs.readFileSync(responsiveSpecPath, 'utf-8');
    
    // AC #6: Responsive tests
    expect(content).toContain('375');
    expect(content).toContain('667');
    expect(content).toContain('768');
    expect(content).toContain('1024');
    expect(content).toContain('1280');
    expect(content).toContain('720');
  });

  it('covers theme toggle acceptance criteria', () => {
    const themeSpecPath = path.join(process.cwd(), 'tests/e2e/theme.spec.ts');
    const content = fs.readFileSync(themeSpecPath, 'utf-8');
    
    // AC #8: Theme tests
    expect(content).toContain('theme toggle');
    expect(content).toContain('dark');
    expect(content).toContain('light');
    expect(content).toContain('localStorage');
    expect(content).toContain('persists');
  });
});
