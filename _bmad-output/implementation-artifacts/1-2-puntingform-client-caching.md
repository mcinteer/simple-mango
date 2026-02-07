# Story 1.2: Puntingform Client & Caching

Status: ready-for-dev

## Story

As a developer (on behalf of the user),
I want the system to cache racing data,
so that the dashboard loads fast and we don't exceed API rate limits.

## Acceptance Criteria

1. **Given** the application is running, **When** a request is made for `GET /api/race-cards`, **Then** the system checks MongoDB for valid cached data (TTL < 1 hour).
2. **Given** valid cached data exists (age < 1 hour), **When** `/api/race-cards` is called, **Then** it returns the cached data immediately without calling Puntingform API.
3. **Given** cached data is missing or expired (age ≥ 1 hour), **When** `/api/race-cards` is called, **Then** it fetches from Puntingform API `/v2/form/results?meetingId=...`, saves to MongoDB, and returns the data.
4. **Given** the Puntingform API call fails, **When** stale cached data exists, **Then** the system returns stale data with a warning flag rather than erroring.
5. **Given** the Puntingform API call fails, **When** no cached data exists, **Then** the system returns a proper error response `{ error: { code: "UPSTREAM_ERROR", message: "..." } }`.
6. **Given** any request to `/api/race-cards`, **When** the user is not authenticated, **Then** the system returns 401.
7. **Given** the system, **When** Puntingform API keys are checked, **Then** they are loaded securely from environment variables (`PUNTINGFORM_API_KEY`, `PUNTINGFORM_BASE_URL`).

## Tasks / Subtasks

- [ ] **Task 1: Puntingform Types** (AC: #3)
  - [ ] Create `/src/types/race.ts` — TypeScript types for Puntingform API responses and internal race data
  - [ ] Define: `Meeting`, `Race`, `Runner` types matching Puntingform data shape
  - [ ] Define: `CachedMeetings` type with `fetchedAt: string` (ISO 8601) and `data: Meeting[]`

- [ ] **Task 2: Puntingform API Client** (AC: #3, #7)
  - [ ] Create `/src/lib/puntingform/client.ts` — API wrapper class/functions
  - [ ] Read `PUNTINGFORM_API_KEY` and `PUNTINGFORM_BASE_URL` from `process.env`
  - [ ] Throw on missing env vars at init
  - [ ] Implement `fetchMeetingsList()` — calls Puntingform `/meetingslist` endpoint (or validated equivalent)
  - [ ] Include proper headers: `Authorization` or API key header per Puntingform docs
  - [ ] Handle HTTP errors (non-2xx) by throwing typed errors
  - [ ] Create `/src/lib/puntingform/types.ts` — raw API response types (if different from internal types)

- [ ] **Task 3: MongoDB Caching Layer** (AC: #1, #2, #4)
  - [ ] Create `/src/lib/puntingform/cache.ts` — caching logic using MongoDB
  - [ ] Create `/src/lib/db/racing-context.ts` — MongoDB operations for `racingContext` collection
  - [ ] Implement `getCachedMeetings(date: string)` — query by date, check `fetchedAt` TTL (1 hour)
  - [ ] Implement `saveMeetingsCache(date: string, data: Meeting[])` — upsert with `fetchedAt` timestamp
  - [ ] Use `racingContext` collection (per architecture)
  - [ ] Cache key: today's date string (ISO 8601 date portion, e.g. `2026-02-07`)
  - [ ] TTL check: `Date.now() - Date.parse(fetchedAt) < 3600000` (1 hour in ms)

- [ ] **Task 4: Race Cards API Route** (AC: #1, #2, #3, #4, #5, #6)
  - [ ] Create `/src/app/api/race-cards/route.ts` — GET handler
  - [ ] Auth check: return 401 if no valid session (use `getServerSession`)
  - [ ] Logic flow: check cache → if valid return cached → else fetch from Puntingform → save cache → return
  - [ ] On Puntingform failure + stale cache: return stale data with `meta: { stale: true }`
  - [ ] On Puntingform failure + no cache: return `{ error: { code: "UPSTREAM_ERROR", message } }` with 502
  - [ ] Success response: `{ data: Meeting[], meta: { cached: boolean, fetchedAt: string } }`

- [ ] **Task 5: Error Utilities** (AC: #4, #5)
  - [ ] Create `/src/lib/utils/errors.ts` — error handling utilities
  - [ ] Implement `createErrorResponse(code, message, status)` helper
  - [ ] Implement `createSuccessResponse(data, meta?)` helper

## Dev Notes

### Tech Stack & Versions
- **MongoDB**: `mongodb@7.1.0` native driver (already installed) — do NOT use Mongoose/Prisma
- **Next.js**: 16.1.6 with App Router
- **TypeScript**: 5.x
- **Auth**: `next-auth@4.24` — use `getServerSession` for API route auth checks

### Puntingform API Details
- **Base URL**: `process.env.PUNTINGFORM_BASE_URL` (default: `https://api.puntingform.com.au`)
- **API Key**: `process.env.PUNTINGFORM_API_KEY`
- **Validated Endpoint (from Spike)**: `/v2/form/results?meetingId=...` confirmed working for runner/odds data
- **Meetings List**: Use `/meetingslist` or equivalent endpoint to get today's meetings
- **Rate Limits**: Respect API limits — this is WHY we cache

### MongoDB Connection
- Reuse existing singleton from `/src/lib/db/client.ts` — call `getDb()` (already implemented in Story 1.1)
- Database name: `simple-mango` (hardcoded in client.ts)
- Collection: `racingContext` (camelCase, per architecture naming convention)

### Critical Architecture Patterns

**API Response Format — MANDATORY:**
```typescript
// Success
{ data: T, meta?: { cached: boolean, fetchedAt: string, stale?: boolean } }
// Error
{ error: { code: string, message: string, details?: unknown } }
```

**Existing types to reuse** (`/src/types/api.ts`):
```typescript
export interface ApiSuccess<T> { data: T; meta?: Record<string, unknown>; }
export interface ApiError { error: { code: string; message: string; details?: unknown; }; }
```

**Naming Conventions:**
- Files: kebab-case (`racing-context.ts`)
- Functions: camelCase (`fetchMeetingsList`)
- DB collections: camelCase plural (`racingContext`)
- DB fields: camelCase (`fetchedAt`, `meetingId`)
- Types: PascalCase (`Meeting`, `Race`, `Runner`)
- Dates: ISO 8601 strings everywhere

### File Structure for This Story
```
src/
├── app/api/
│   └── race-cards/
│       └── route.ts              # NEW: GET handler
├── lib/
│   ├── db/
│   │   ├── client.ts             # EXISTS: reuse getDb()
│   │   └── racing-context.ts     # NEW: cache CRUD
│   ├── puntingform/
│   │   ├── client.ts             # NEW: API wrapper
│   │   ├── types.ts              # NEW: raw API types
│   │   └── cache.ts              # NEW: cache orchestration
│   └── utils/
│       └── errors.ts             # NEW: response helpers
└── types/
    ├── api.ts                    # EXISTS: reuse ApiSuccess/ApiError
    └── race.ts                   # NEW: Meeting, Race, Runner
```

### Previous Story (1.1) Learnings
- Next.js 16 uses Tailwind v4 with CSS-based config (not `tailwind.config.ts`)
- Middleware uses `getToken` + `NextResponse.redirect` pattern (not deprecated default export)
- `getDb()` returns connected Db instance from singleton — tested and working
- Auth session uses JWT strategy — use `getServerSession(authOptions)` in API routes
- Auth config is at `/src/lib/auth/config.ts` — import `authOptions` from there

### Anti-Patterns to Avoid
- ❌ Do NOT create a new MongoDB connection — reuse `getDb()` from `lib/db/client.ts`
- ❌ Do NOT use Mongoose/Prisma — native `mongodb` driver only
- ❌ Do NOT store TTL as MongoDB TTL index (we want graceful stale fallback, not auto-delete)
- ❌ Do NOT hardcode API keys — always read from `process.env`
- ❌ Do NOT use `/pages/api/` — use App Router `/app/api/` with `route.ts`
- ❌ Do NOT make Puntingform calls without checking cache first
- ❌ Do NOT let Puntingform errors crash the request when stale data is available
- ❌ Do NOT put feature hooks in `/hooks/` — this story has no client components

### Testing Approach
- Manual testing acceptable (per Story 1.1 precedent)
- Test cache miss → API call → cache hit flow manually via browser/curl
- Test error handling by temporarily using wrong API key
- Verify auth protection by calling without session

### References
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture — Caching Strategy]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns — Puntingform Integration]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2]
- [Source: _bmad-output/implementation-artifacts/1-1-project-initialization-auth.md#Dev Notes — MongoDB Connection]
- [Source: _bmad-output/planning-artifacts/architecture.md#Architecture Adjustments (Post-Spike)]

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
