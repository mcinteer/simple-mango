# Story 1.3: Dashboard & Meeting List

Status: done

## Story

As a user,
I want to see all today's race meetings grouped by state,
so that I can quickly find the race I want to bet on.

## Acceptance Criteria

1. **Given** the user is logged in, **When** they visit `/dashboard`, **Then** they see a list of today's Australian race meetings.
2. **Given** the dashboard is displayed, **When** meetings are rendered, **Then** they are grouped by State (VIC, NSW, QLD, SA, WA, TAS, ACT, NT).
3. **Given** meetings are grouped by state, **When** a state section is displayed, **Then** each meeting card shows the Track Name and Start Time of the first race.
4. **Given** the dashboard is loading data, **When** the API call is in progress, **Then** skeleton loaders are displayed.
5. **Given** the API returns an error, **When** the dashboard attempts to render, **Then** an error message is displayed with a retry option.
6. **Given** any dashboard view, **When** the UI is rendered, **Then** it follows the "Tuxedo" dark mode aesthetic (dark background, gold/obsidian accents).

## Tasks / Subtasks

- [x] **Task 1: Meeting Card Component** (AC: #3, #6)
  - [x] Create `/src/components/features/dashboard/meeting-card.tsx`
  - [x] Display Track Name prominently
  - [x] Display Start Time of first race (format: "HH:MM" local time)
  - [x] Dark mode styling with gold accents on hover
  - [x] Clickable — will navigate to meeting detail (wire up in Story 1.4)
  - [x] Create `/src/components/features/dashboard/meeting-card.test.tsx`

- [x] **Task 2: State Group Component** (AC: #2, #6)
  - [x] Create `/src/components/features/dashboard/state-group.tsx`
  - [x] Accept state name and array of meetings
  - [x] Render state name as section header
  - [x] Render list of `MeetingCard` components
  - [x] ~Collapsible section~ (deferred — optional enhancement, not in ACs)
  - [x] Create `/src/components/features/dashboard/state-group.test.tsx`

- [x] **Task 3: Skeleton Loaders** (AC: #4, #6)
  - [x] Create `/src/components/features/dashboard/meeting-skeleton.tsx`
  - [x] Create `/src/components/features/dashboard/dashboard-skeleton.tsx` (combined in meeting-skeleton.tsx)
  - [x] Match the shape of actual cards/groups
  - [x] Use Tailwind `animate-pulse` pattern

- [x] **Task 4: Dashboard Data Hook** (AC: #1, #5)
  - [x] Create `/src/components/features/dashboard/use-race-cards.ts`
  - [x] Fetch from `GET /api/race-cards` (built in Story 1.2)
  - [x] Return: `{ meetings, isLoading, error, refetch }`
  - [x] Group meetings by state (transformation logic)
  - [x] Create `/src/components/features/dashboard/use-race-cards.test.ts`

- [x] **Task 5: Race List Component** (AC: #1, #2, #4, #5)
  - [x] Create `/src/components/features/dashboard/race-list.tsx`
  - [x] Uses `useRaceCards()` hook
  - [x] Loading state → render `DashboardSkeleton`
  - [x] Error state → render error message with retry button
  - [x] Success state → render `StateGroup` for each state with meetings
  - [x] Create `/src/components/features/dashboard/race-list.test.tsx`

- [x] **Task 6: Dashboard Page Integration** (AC: #1, #6)
  - [x] Update `/src/app/(auth)/dashboard/page.tsx`
  - [x] Import and render `RaceList` component
  - [x] Add page title/header
  - [x] Ensure Tuxedo dark mode styling

- [x] **Task 7: Barrel Exports** (AC: all)
  - [x] Create `/src/components/features/dashboard/index.ts`
  - [x] Export all dashboard components

## Dev Notes

### Tech Stack & Versions
- **Next.js**: 16.1.6 with App Router
- **TypeScript**: 5.x
- **Tailwind CSS**: v4 (CSS-based config, not `tailwind.config.ts`)
- **Testing**: Vitest with `@testing-library/react`

### API Endpoint (Already Built)
The `/api/race-cards` endpoint from Story 1.2 returns:
```typescript
// Success response
{
  data: Meeting[],
  meta: { cached: boolean, fetchedAt: string, stale?: boolean }
}

// Meeting type (from src/types/race.ts)
interface Meeting {
  meetingId: string;
  trackName: string;
  state: string;          // VIC, NSW, QLD, SA, WA, TAS, ACT, NT
  meetingDate: string;    // ISO 8601
  raceType: string;       // Thoroughbred, Harness, Greyhound
  races: Race[];
}

interface Race {
  raceNumber: number;
  raceName: string;
  startTime: string;      // ISO 8601
  status: string;
}
```

### State Grouping Logic
```typescript
// Group meetings by state
function groupByState(meetings: Meeting[]): Record<string, Meeting[]> {
  return meetings.reduce((acc, meeting) => {
    const state = meeting.state || 'Other';
    if (!acc[state]) acc[state] = [];
    acc[state].push(meeting);
    return acc;
  }, {} as Record<string, Meeting[]>);
}

// Sort states in preferred order
const STATE_ORDER = ['VIC', 'NSW', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT', 'Other'];
```

### Tuxedo Dark Mode Aesthetic
Per architecture and PRD:
- **Background**: Dark/obsidian (`bg-zinc-900` or `bg-neutral-950`)
- **Cards**: Slightly lighter (`bg-zinc-800/50` or `bg-neutral-900`)
- **Text**: White/gray (`text-white`, `text-zinc-400`)
- **Accents**: Gold (`text-amber-500`, `border-amber-500/50`)
- **Hover**: Gold glow or subtle lift (`hover:border-amber-500`)
- **Borders**: Subtle (`border-zinc-700`)

### Component Structure
```
src/components/features/dashboard/
├── index.ts                    # Barrel exports
├── meeting-card.tsx            # Single meeting card
├── meeting-card.test.tsx
├── meeting-skeleton.tsx        # Skeleton for single card
├── dashboard-skeleton.tsx      # Skeleton for full dashboard
├── state-group.tsx             # State section with cards
├── state-group.test.tsx
├── race-list.tsx               # Main orchestrator component
├── race-list.test.tsx
├── use-race-cards.ts           # Data fetching hook
└── use-race-cards.test.ts
```

### Existing UI Primitives (Reuse)
From `/src/components/ui/`:
- `Button` — for retry button
- `Card` — base card styling (adapt for meeting cards)

### Date Formatting
```typescript
// Format start time as local HH:MM
function formatStartTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-AU', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
}
```

### Critical Architecture Patterns

**Hook Pattern:**
```typescript
// Feature-specific hooks live WITH the feature
// src/components/features/dashboard/use-race-cards.ts
export function useRaceCards() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const refetch = useCallback(async () => { /* ... */ }, []);
  
  useEffect(() => { refetch(); }, [refetch]);
  
  return { meetings, isLoading, error, refetch };
}
```

**Component Props Pattern:**
```typescript
interface MeetingCardProps {
  meeting: Meeting;
  onClick?: () => void;
}

interface StateGroupProps {
  stateName: string;
  meetings: Meeting[];
}
```

**Naming Conventions:**
- Files: kebab-case (`meeting-card.tsx`)
- Components: PascalCase (`MeetingCard`)
- Hooks: camelCase with `use` prefix (`useRaceCards`)
- Tests: co-located (`meeting-card.test.tsx`)

### Anti-Patterns to Avoid
- ❌ Do NOT put the hook in `/src/hooks/` — it's feature-specific, keep it with the dashboard components
- ❌ Do NOT use `tailwind.config.ts` — Tailwind v4 uses CSS-based config
- ❌ Do NOT fetch data in the page component — use the hook in a client component
- ❌ Do NOT hardcode colors — use Tailwind classes for consistent theming
- ❌ Do NOT forget loading states — users on 4G need feedback
- ❌ Do NOT ignore error states — always provide retry option
- ❌ Do NOT use `any` type — use `unknown` or proper types

### Testing Approach
- **Components**: Use `@testing-library/react`, render with mock data
- **Hooks**: Use `@testing-library/react` `renderHook`, mock fetch
- **Pattern**: TDD — write failing test first, then implement
- **Quality Gate**: `npm run check` must pass (tsc + eslint + vitest)

### Previous Story Learnings (from 1.2)
- `getDb()` singleton works correctly for MongoDB access
- API route auth uses `getServerSession(authOptions)` pattern
- Error utilities exist at `/src/lib/utils/errors.ts`
- Types for `Meeting`, `Race`, `Runner` exist at `/src/types/race.ts`
- The `/api/race-cards` endpoint returns `{ data: Meeting[], meta: {...} }`

### Dashboard Page Currently
The dashboard page at `/src/app/(auth)/dashboard/page.tsx` currently exists but is minimal. Update it to integrate the new components.

### Project Context
- **Quality Gate**: All tasks MUST pass `npm run check` before completion
- **Testing**: TDD required — write tests FIRST
- **Co-location**: Tests live next to source files

### References
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries — Component Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: _bmad-output/implementation-artifacts/1-2-puntingform-client-caching.md — API Response Format]
- [Source: src/types/race.ts — Meeting, Race types]
- [Source: project-context.md — Quality Gate, Testing Standards]

## Dev Agent Record

### Agent Model Used
Claude (Amelia - Dev Agent)

### Debug Log References
- Updated `Meeting` type to add `trackName` and `state` fields (per story spec)
- Updated `fetchMeetingsList` client to map API fields correctly
- Fixed existing tests to use new type shape
- Configured Vitest for React component testing (jsdom, @testing-library/react)

### Completion Notes List
- ✅ All 7 tasks completed with TDD approach
- ✅ 27 new tests added (48 total project tests)
- ✅ Components follow Tuxedo dark mode aesthetic (zinc-900, amber-500 accents)
- ✅ Full loading → error → success state handling
- ✅ Meetings grouped by state with VIC/NSW/QLD priority ordering

### Change Log
- 2026-02-08: Story 1-3 implemented — Dashboard meeting list with state grouping, skeletons, error handling
- 2026-02-08: Code review fixes — H1: res.ok check before res.json(); M1: fixed error test mocks; M2: null guard on races.length; M3: AbortController cleanup in useRaceCards; L1: strengthened dark mode test assertion

### File List
- `src/types/race.ts` (modified: trackName, state fields)
- `src/lib/puntingform/client.ts` (modified: mapping)
- `src/lib/puntingform/client.test.ts` (modified: fixture)
- `src/lib/puntingform/cache.test.ts` (modified: fixture)
- `src/lib/db/racing-context.test.ts` (modified: fixture)
- `src/app/api/race-cards/route.test.ts` (modified: fixture)
- `src/components/features/dashboard/meeting-card.tsx` (new)
- `src/components/features/dashboard/meeting-card.test.tsx` (new)
- `src/components/features/dashboard/state-group.tsx` (new)
- `src/components/features/dashboard/state-group.test.tsx` (new)
- `src/components/features/dashboard/meeting-skeleton.tsx` (new)
- `src/components/features/dashboard/meeting-skeleton.test.tsx` (new)
- `src/components/features/dashboard/use-race-cards.ts` (new)
- `src/components/features/dashboard/use-race-cards.test.ts` (new)
- `src/components/features/dashboard/race-list.tsx` (new)
- `src/components/features/dashboard/race-list.test.tsx` (new)
- `src/components/features/dashboard/index.ts` (new)
- `src/app/(auth)/dashboard/page.tsx` (modified)
- `vitest.config.ts` (modified: jsdom, .tsx support)
- `vitest.setup.ts` (new)
- `package.json` (modified: new devDeps)

