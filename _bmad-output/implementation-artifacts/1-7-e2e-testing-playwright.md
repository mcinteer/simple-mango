# Story 1.7: E2E Testing with Playwright

Status: ready-for-dev

## Story

As a developer,
I want a Playwright E2E test suite covering auth flows, dashboard happy path, error/retry states, and responsive viewports,
so that we have automated confidence in Epic 1 features before moving to Epic 2.

## Acceptance Criteria

1. **Given** the project has no E2E framework, **When** Playwright is installed, **Then** `playwright.config.ts` exists at repo root with `webServer` config pointing to Next.js dev server, and `tests/e2e/` is the test directory.
2. **Given** the auth flow exists (Story 1.1), **When** the auth E2E tests run, **Then** they cover: registration with age-gate validation (checkbox required), Google sign-in button presence, login/logout round-trip, and redirect to `/dashboard` on success.
3. **Given** authenticated state is needed for most tests, **When** the test suite runs, **Then** a shared `storageState` (auth fixture) is used so login only happens once in the setup project, not per-test.
4. **Given** the dashboard exists (Story 1.3), **When** the dashboard happy-path tests run, **Then** they verify: meetings grouped by state headers, meeting cards showing track name and start time, skeleton loaders appear during loading, and navigation to a meeting detail route.
5. **Given** the API can fail, **When** error/retry E2E tests run, **Then** they verify: an error message displays when the API returns 500 (use route interception), the retry button is visible and functional, and successful retry renders the dashboard correctly.
6. **Given** the app is responsive, **When** viewport tests run, **Then** they verify layout correctness at three breakpoints: mobile (375×667), tablet (768×1024), and desktop (1280×720) — checking that key elements (nav, meeting cards, theme toggle) are visible and properly laid out.
7. **Given** all E2E tests are written, **When** `npm run test:e2e` is executed, **Then** all tests pass and the command is documented in `package.json` scripts.
8. **Given** the theme toggle exists (Story 1.6), **When** the theme E2E test runs, **Then** it verifies toggling between light/dark mode and that the preference persists across page reload.

## Tasks / Subtasks

- [ ] **Task 1: Playwright Setup & Configuration** (AC: #1, #7)
  - [ ] Install Playwright: `npm init playwright@latest` — select `tests/e2e` as test dir, do NOT install GitHub Actions workflow
  - [ ] Configure `playwright.config.ts`:
    - `testDir: './tests/e2e'`
    - `webServer: { command: 'npm run dev', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI }`
    - Projects: `chromium` only for now (keep fast, expand later)
    - `use.baseURL: 'http://localhost:3000'`
  - [ ] Add `test:e2e` script to `package.json`: `"test:e2e": "npx playwright test"`
  - [ ] Add `/test-results/`, `/playwright-report/`, `/playwright/.cache/` to `.gitignore`
  - [ ] Verify `npx playwright test` runs (even with 0 tests)

- [ ] **Task 2: Auth Fixture (storageState pattern)** (AC: #3)
  - [ ] Create `tests/e2e/setup/auth.setup.ts` as a setup project
  - [ ] Perform login via Email/Password credential flow
  - [ ] Save `storageState` to `tests/e2e/.auth/user.json`
  - [ ] Add `tests/e2e/.auth/` to `.gitignore`
  - [ ] Configure `playwright.config.ts` with `setup` project that runs first + `dependencies: ['setup']` on main project
  - [ ] All subsequent tests inherit authenticated state automatically

- [ ] **Task 3: Auth Flow Tests** (AC: #2)
  - [ ] Create `tests/e2e/auth.spec.ts`
  - [ ] Test: Landing page shows Sign Up / Sign In options
  - [ ] Test: Registration form requires age-gate checkbox — submit without it → error visible
  - [ ] Test: Google sign-in button is present and has correct OAuth href
  - [ ] Test: Successful email/password login → redirects to `/dashboard`
  - [ ] Test: Logout → redirects to landing, dashboard is no longer accessible

- [ ] **Task 4: Dashboard Happy Path Tests** (AC: #4)
  - [ ] Create `tests/e2e/dashboard.spec.ts`
  - [ ] Test: Dashboard page loads with state group headings (e.g., "VIC", "NSW")
  - [ ] Test: Meeting cards display track name and start time
  - [ ] Test: Clicking a meeting card navigates to `/race/[id]` route
  - [ ] Test: Skeleton loaders appear before data resolves (use `page.route()` to delay API response)

- [ ] **Task 5: Error & Retry Tests** (AC: #5)
  - [ ] Create `tests/e2e/error-retry.spec.ts`
  - [ ] Use `page.route('**/api/race-cards**', route => route.fulfill({ status: 500 }))` to simulate API failure
  - [ ] Test: Error message is displayed to user
  - [ ] Test: Retry button is visible
  - [ ] Use `page.unroute()` then click retry → verify dashboard renders correctly

- [ ] **Task 6: Responsive Viewport Tests** (AC: #6)
  - [ ] Create `tests/e2e/responsive.spec.ts`
  - [ ] Define viewport fixtures: `{ mobile: {width:375,height:667}, tablet: {width:768,height:1024}, desktop: {width:1280,height:720} }`
  - [ ] For each viewport, test:
    - Navigation elements are visible and accessible
    - Meeting cards render without horizontal overflow
    - Theme toggle is reachable
  - [ ] Mobile: verify hamburger/collapsed nav if applicable
  - [ ] Desktop: verify full nav layout

- [ ] **Task 7: Theme Toggle E2E** (AC: #8)
  - [ ] Add to `tests/e2e/dashboard.spec.ts` or separate `theme.spec.ts`
  - [ ] Test: Click theme toggle → `<html>` class or `data-theme` attribute changes
  - [ ] Test: Reload page → theme persists (localStorage)
  - [ ] Test: Default state is dark mode

## Dev Notes

### Architecture Compliance
- **Test location:** `tests/e2e/` — separate from unit tests (co-located `*.test.ts`) and integration tests (`tests/integration/`)
- **Do NOT modify `npm run check`** — E2E tests are a separate gate (`npm run test:e2e`), not part of the fast unit/lint check
- **Chromium only for V1** — multi-browser can be added later by adding projects to config

### Technical Stack
- **Playwright:** Latest stable (`@playwright/test`)
- **Next.js 16.x App Router** — `webServer` config handles dev server lifecycle
- **Auth:** NextAuth.js — the `storageState` pattern captures the NextAuth session cookie

### Key Patterns
- **Route interception** (`page.route()`) for error simulation — do NOT mock at the service layer, this is E2E
- **`storageState`** for auth — login once in setup, reuse everywhere. This is Playwright's recommended pattern.
- **Assertions:** Use Playwright's built-in `expect(locator)` matchers (`.toBeVisible()`, `.toHaveText()`, etc.) — do NOT import external assertion libraries

### What Already Exists (from Stories 1.1–1.3)
- Auth: `/src/app/api/auth/[...nextauth]/route.ts`, registration with age-gate
- Dashboard: `/src/app/dashboard/page.tsx`, meeting cards grouped by state
- Components: `meeting-card.tsx`, `state-group.tsx`, skeleton loaders
- API: `/src/app/api/race-cards/route.ts` with MongoDB caching

### Gotchas
- NextAuth CSRF token — Playwright's `storageState` must capture all cookies including `next-auth.csrf-token`
- Next.js App Router may need `--turbopack` flag in dev for speed — test both, use whichever is stable
- `page.route()` intercepts happen at the browser level — make sure URL patterns match the actual fetch URLs from client components

### References
- [Source: _bmad-output/planning-artifacts/architecture.md — Testing section, line 394]
- [Source: project-context.md — Testing Standards]
- [Source: _bmad-output/planning-artifacts/architecture.md — File structure, line 586]
- [Playwright docs: https://playwright.dev/docs/auth]
- [Playwright docs: https://playwright.dev/docs/test-webserver]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
