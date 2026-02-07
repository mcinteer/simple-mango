---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
status: 'complete'
completedAt: '2026-02-06'
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/product-brief-Current Project-2026-02-04.md']
workflowType: 'architecture'
project_name: 'Current Project'
user_name: 'Raz'
date: '2026-02-06'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Constraints (Pre-Established)

| Constraint | Decision | Rationale |
|------------|----------|-----------|
| **Hosting Platform** | Vercel | New to user, generous free tier, Next.js native |
| **Database** | MongoDB Atlas | Free tier, family connection, document model fits racing data |
| **AI Architecture** | Agent Framework | Wingman needs skills, personality, future persona marketplace |
| **Bookmaker OAuth** | Descoped (MVP) | Not available from bookmakers |
| **Cost Model** | Serverless/free-tier first | Prove PMF before scaling costs |
| **Team Size** | Solo + AI agents | Simplicity over enterprise patterns |

## Project Context Analysis

### Requirements Overview

**Functional Requirements (9 FRs across 3 domains):**
- Data & Dashboard (FR1-FR3): External API aggregation, real-time odds, conditional alerts
- AI Wingman (FR4-FR6): Conversational interface, risk flagging, skeptical mode
- Bankroll & Logging (FR7-FR9): Manual P&L logging (OAuth descoped), health bar visualization, "Money Saved" calculation

**Non-Functional Requirements:**
- Performance: AI <3s, Odds <5s refresh, LCP <2.5s on 4G
- Security: Encryption at rest, age-gating (18+)
- Reliability: WebSocket with polling fallback, 99.9% uptime target for data ingestion

### Scale & Complexity

- **Complexity Level:** High
- **Primary Domain:** Full-stack PWA (mobile-first)
- **Technical Domain:** Wagering/Fintech with AI-native UX
- **Estimated Architectural Components:** 6-8 major services/modules

### Technical Constraints & Dependencies

- External: Puntingform API (racing data - to be validated in spike), LLM provider (TBD)
- Platform: Vercel (hosting), MongoDB Atlas free tier (512MB)
- Descoped: Bookmaker OAuth — manual bet logging only

### Cross-Cutting Concerns

1. Real-time data flow (odds, alerts, race status)
2. AI context management (form data, user history, track bias)
3. Gamification state (streaks, health bars, Money Saved)
4. PWA requirements (offline, push notifications, mobile-first)
5. Cost efficiency (serverless-first, free-tier friendly)

---

### Architectural Decisions (From Elicitation)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | Next.js App Router | AI streaming support, Vercel native |
| Real-time (MVP) | SSE for AI, Polling for odds | Simplicity; revisit WebSockets in v1 |
| AI Framework | Vercel AI SDK + Custom Agent | Lightweight, streaming-native, full control |
| Database | MongoDB Atlas with Vector Search | RAG for Wingman, no separate vector DB |
| Data Strategy | Cache-first + Supplementary Context DB | Build proprietary racing context over time |

### Architecture Adjustments (Post-Spike)

| Component | Adjustment | Rationale |
|-----------|------------|-----------|
| **Race Card Strategy** | Use `/v2/form/results?meetingId=...` | Spike confirmed this endpoint provides necessary runner and odds data |
| **AI Model** | Google Gemini (`gemini-2.0-flash`) | Validated during spike for performance and streaming capabilities |
| **Env Variables** | Add `GOOGLE_GENERATIVE_AI_API_KEY` | Required for Gemini model |

### V0 Definition

| Aspect | Decision |
|--------|----------|
| **Target User** | Arthur (the Improver) |
| **Core Loop** | See races → Ask Wingman → Log bet → See spend |
| **Dashboard** | Race cards from Puntingform, basic form display |
| **Wingman** | Chat interface, explanatory mode, racing context |
| **Logging** | Manual entry + voice/chat input via Wingman |
| **Bankroll** | Passive display ("You've bet $X today") |
| **Deferred** | Sentinels, Streaks, Push, Full Health Bar |

### Wingman Interaction Modes

| Mode | User | Behaviour |
|------|------|-----------|
| Power Query | Sam | Terse input → data output (tables, stats) |
| Explanatory | Arthur | Reasoning, teaching, "why" explanations |
| Passive Nudge | Cathy | Proactive warnings, minimal friction |

*(V0 focuses on Explanatory mode for Arthur)*

### Gaps to Resolve in Architecture

| Gap | Resolution Path |
|-----|-----------------|
| Context DB schema | Define during architecture step |
| Race results ingestion | Validate in Puntingform spike |
| Staking plan config | Deferred (passive display only for V0) |
| Sentinel architecture | Deferred |
| Odds polling strategy | Define during architecture step |
| Push notification infra | Deferred |

### Technical Spike (Pre-Build Validation)

| Task | Purpose | Status |
|------|---------|--------|
| Puntingform API access | Confirm auth, endpoints, rate limits | ✅ Complete |
| Display one race card | Validate data shape and display | ✅ Complete |
| Wingman + racing context | Validate LLM + context retrieval | ✅ Complete |
| Store bet + reconcile result | Validate results data availability | ✅ Complete |

### User Privacy Considerations

- Users need visibility into their data
- Export and delete capabilities required
- Shared device scenarios (Cathy's concern) — address in v1

### Cost Model Assumptions

- ~100 tokens/query, $0.01/1K tokens
- 5 queries/user/session, 1000 users on race day = ~$5/day AI costs
- Usage caps for free tier, Pro tier unlocks unlimited Wingman

---

## Starter Template Evaluation

### Primary Technology Domain

Full-stack PWA (Web Application) — Next.js on Vercel with MongoDB backend.

### Starter Options Considered

| Option | Verdict |
|--------|---------|
| create-next-app (vanilla) | ✅ Selected — clean slate, full control |
| create-t3-app | ❌ Prisma doesn't fit MongoDB well |
| Vercel AI Chatbot Template | ❌ Too opinionated for dashboard app |

### Selected Starter: create-next-app (vanilla)

**Rationale:**
- Clean foundation with no unwanted patterns
- MongoDB native driver preferred over Prisma
- AI agents can easily add packages as needed
- Full control over architecture

**Initialization Command:**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Additional Dependencies:**
```bash
npm install ai mongodb next-auth
```

### Architectural Decisions Provided by Starter

| Category | Decision |
|----------|----------|
| **Language** | TypeScript 5.x |
| **Framework** | Next.js 16.x (App Router) |
| **Styling** | Tailwind CSS 3.x |
| **Linting** | ESLint (Next.js config) |
| **Build** | Turbopack (dev), Webpack (prod) |
| **Structure** | `/src/app` routes, `/src/components` UI |

### Manual Additions Required

| Package | Purpose |
|---------|---------|
| `ai` (Vercel AI SDK) | Wingman streaming, agent framework |
| `mongodb` | Native MongoDB driver for Atlas |
| `next-auth` | Authentication with 18+ age-gating |

**Note:** Project initialization using this command should be the first implementation story.

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- MongoDB schema approach (hybrid)
- Authentication flow (NextAuth.js with Google + Email)
- API design (Next.js API Routes)
- Wingman architecture (Vercel AI SDK + custom agent)

**Important Decisions (Shape Architecture):**
- Vector search strategy (MongoDB Atlas native)
- State management (Server Components + Zustand)
- Caching strategy (MongoDB TTL)
- Error handling patterns

**Deferred Decisions (Post-MVP):**
- Push notification infrastructure
- Sentinel background processing
- Advanced rate limiting
- ID verification for age-gating

---

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Schema Approach** | Hybrid (embed + reference) | Embed for user settings, reference for bets and racing context |
| **Collections** | `users`, `bets`, `racingContext`, `sessions` | Clean separation, scalable |
| **Vector Search** | MongoDB Atlas native | No separate vector DB, simplifies infrastructure |
| **Embedding Model** | OpenAI `text-embedding-3-small` | Cost-effective, sufficient quality for RAG |
| **Embedded Content** | Form summaries, track bias, user bet patterns | Rich context for Wingman |

**Caching Strategy:**

| Data Type | Approach |
|-----------|----------|
| Race cards | MongoDB with 1-hour TTL |
| Odds | No cache — poll live |
| Form data | Aggressive caching (static) |
| AI embeddings | Pre-computed in MongoDB |

---

### Authentication & Security

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Auth Library** | NextAuth.js 4.24.x | Standard for Next.js, handles OAuth + credentials |
| **Providers** | Google OAuth + Email/Password | Flexibility for users |
| **Age-Gating** | Self-declaration checkbox + DOB collection | Legally sufficient, DOB stored for future |
| **Session Strategy** | JWT (stateless) | Vercel-friendly, no session storage needed |

**Security Layers:**

| Layer | Implementation |
|-------|----------------|
| In transit | HTTPS (Vercel default) |
| At rest | MongoDB Atlas encryption (default) |
| Application | No additional encryption for MVP |

---

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **API Layer** | Next.js API Routes | Native, simple, Vercel-optimized |
| **API Location** | `/src/app/api/` | App Router convention |
| **Response Format** | JSON with consistent error shape | `{ error, code, details? }` |
| **HTTP Codes** | Standard REST (400, 401, 404, 500) | Familiar, predictable |

**Puntingform Integration:**

| Aspect | Approach |
|--------|----------|
| Client wrapper | `/src/lib/puntingform/client.ts` |
| Error handling | Graceful degradation to cached data |
| Rate limiting | Request queue, respect API limits |

**AI Streaming:**

| Aspect | Approach |
|--------|----------|
| Protocol | Server-Sent Events (SSE) |
| SDK | Vercel AI SDK `streamText()` |
| Client | `useChat()` hook |

---

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **State Management** | Server Components + Zustand | Server for data, Zustand for UI state |
| **Auth State** | React Context (via NextAuth) | Standard pattern |
| **Component Structure** | `/src/components/ui/` + `/src/components/features/` | Primitives vs composed |
| **Naming** | PascalCase components, kebab-case files | Standard convention |

**Wingman Chat UI:**

| Aspect | Decision |
|--------|----------|
| Position | Collapsible sidebar |
| Streaming | Vercel AI SDK `useChat()` |
| Input | Text (voice input deferred) |
| History | MongoDB per user session |

---

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Hosting** | Vercel | Native Next.js, free tier, zero-config |
| **CI/CD** | Vercel auto-deploy | Push to main = production |
| **Preview** | Vercel preview deployments | Per-PR previews automatic |
| **Checks** | ESLint + TypeScript + Build | Must pass before deploy |

**Environments:**

| Environment | Trigger | Config |
|-------------|---------|--------|
| Development | Local | `.env.local` |
| Preview | PR push | Vercel preview env vars |
| Production | Main branch push | Vercel production env vars |

**Monitoring (MVP):**

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Web vitals, performance |
| Vercel Logs | Function execution, errors |
| MongoDB Atlas | Database metrics |

---

### Decision Impact Analysis

**Implementation Sequence:**
1. Project initialization (starter template)
2. MongoDB connection + schema setup
3. NextAuth.js configuration
4. Puntingform API client
5. Racing dashboard UI
6. Wingman chat integration
7. Bet logging flow
8. Passive bankroll display

**Cross-Component Dependencies:**
- Wingman depends on: MongoDB (embeddings), Puntingform (context), Auth (user history)
- Dashboard depends on: Puntingform (race data), Auth (personalization)
- Bet logging depends on: Auth (user), MongoDB (storage), Puntingform (race metadata)

---

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Addressed:** 6 categories (naming, structure, format, communication, process, enforcement)

### Naming Patterns

**Database (MongoDB):**
- Collections: camelCase, plural (`users`, `bets`, `racingContext`)
- Fields: camelCase (`userId`, `createdAt`)
- Foreign refs: `{entity}Id` pattern

**API (Next.js Routes):**
- Endpoints: kebab-case, plural (`/api/race-cards`)
- Route params: `[id]` (Next.js convention)
- Query params: camelCase

**Code (TypeScript/React):**
- Components: PascalCase (`RaceCard`)
- Files: kebab-case (`race-card.tsx`)
- Functions: camelCase (`fetchRaceData`)
- Types: PascalCase (`Race`, `Bet`)
- Hooks: `use` prefix (`useRaceData`)

### Structure Patterns

```
/src
├── /app                    # Next.js App Router
│   ├── /api               # API routes
│   └── /(auth)            # Auth-required routes
├── /components
│   ├── /ui                # Primitives
│   └── /features          # Composed components
├── /lib
│   ├── /db                # MongoDB
│   ├── /puntingform       # API client
│   └── /ai                # Wingman
├── /hooks                  # Shared hooks only
├── /types                  # TypeScript types
└── /stores                 # Zustand stores
```

**Testing:** Unit tests co-located (`*.test.tsx`), integration in `/tests/`

### Format Patterns

**API Responses:**
- Success: `{ data: T, meta?: {...} }`
- Error: `{ error: { code, message, details? } }`

**Data Formats:**
- Dates: ISO 8601 strings in API
- Money: Integer cents (2500 = $25.00)
- Odds: Decimal format (4.50)
- JSON: camelCase fields

### Process Patterns

**Error Handling:**
- API: try/catch with consistent error response
- Client: error/loading/data pattern from hooks

**Loading States:**
- Pages: `loading.tsx` files
- Components: Skeleton components
- Buttons: Disable + spinner

### Enforcement Guidelines

**All AI Agents MUST:**
1. Follow naming conventions exactly
2. Place files in correct directories
3. Use standard error response format
4. Store money as integer cents
5. Use ISO 8601 for date strings
6. Co-locate unit tests with source files

**Anti-Patterns (DO NOT):**
- ❌ `Users` collection (use `users`)
- ❌ `user_id` in TypeScript (use `userId`)
- ❌ `/api/getRaceCards` (use `/api/race-cards` with GET)
- ❌ `RaceCard.tsx` file (use `race-card.tsx`)
- ❌ Storing `stake: 25.00` (use `stake: 2500` cents)
- ❌ Throwing raw errors from API routes

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
simple-mango/
├── README.md
├── package.json
├── package-lock.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
├── .env.local                    # Local dev secrets (git-ignored)
├── .env.example                  # Template for required env vars
├── .gitignore
├── .eslintrc.json
│
├── src/
│   ├── app/
│   │   ├── globals.css           # Tailwind imports + custom styles
│   │   ├── layout.tsx            # Root layout (auth provider, etc.)
│   │   ├── page.tsx              # Landing/home page
│   │   ├── loading.tsx           # Root loading state
│   │   ├── error.tsx             # Root error boundary
│   │   │
│   │   ├── (auth)/               # Auth-required route group
│   │   │   ├── layout.tsx        # Protected layout wrapper
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx      # Main racing dashboard
│   │   │   │   └── loading.tsx
│   │   │   ├── race/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx  # Individual race detail
│   │   │   └── vault/
│   │   │       └── page.tsx      # Bankroll/bet history view
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx          # Login page
│   │   ├── register/
│   │   │   └── page.tsx          # Registration + age-gating
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts  # NextAuth.js handler
│   │       ├── race-cards/
│   │       │   └── route.ts      # GET: list today's races
│   │       ├── races/
│   │       │   └── [id]/
│   │       │       └── route.ts  # GET: race detail + form
│   │       ├── bets/
│   │       │   ├── route.ts      # GET: list, POST: create bet
│   │       │   └── [id]/
│   │       │       └── route.ts  # GET/PUT/DELETE single bet
│   │       ├── chat/
│   │       │   └── route.ts      # POST: Wingman streaming chat
│   │       └── user/
│   │           └── bankroll/
│   │               └── route.ts  # GET: today's spend summary
│   │
│   ├── components/
│   │   ├── ui/                   # Primitive components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   └── index.ts          # Barrel export
│   │   │
│   │   └── features/             # Composed feature components
│   │       ├── dashboard/
│   │       │   ├── race-card.tsx
│   │       │   ├── race-list.tsx
│   │       │   ├── odds-display.tsx
│   │       │   ├── meeting-tabs.tsx
│   │       │   ├── use-race-cards.ts    # Feature-specific hook
│   │       │   └── index.ts             # Barrel export
│   │       ├── wingman/
│   │       │   ├── wingman-sidebar.tsx
│   │       │   ├── chat-message.tsx
│   │       │   ├── chat-input.tsx
│   │       │   ├── wingman-toggle.tsx
│   │       │   ├── use-wingman-chat.ts  # Feature-specific hook
│   │       │   └── index.ts
│   │       ├── betting/
│   │       │   ├── bet-form.tsx
│   │       │   ├── bet-card.tsx
│   │       │   ├── bet-history.tsx
│   │       │   ├── use-bets.ts          # Feature-specific hook
│   │       │   └── index.ts
│   │       ├── bankroll/
│   │       │   ├── spend-display.tsx
│   │       │   ├── daily-summary.tsx
│   │       │   ├── use-bankroll.ts      # Feature-specific hook
│   │       │   └── index.ts
│   │       └── auth/
│   │           ├── login-form.tsx
│   │           ├── register-form.tsx
│   │           ├── age-gate.tsx
│   │           ├── user-menu.tsx
│   │           └── index.ts
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── client.ts         # MongoDB connection singleton
│   │   │   ├── users.ts          # User CRUD operations
│   │   │   ├── bets.ts           # Bet CRUD operations
│   │   │   └── racing-context.ts # Racing data cache operations
│   │   │
│   │   ├── puntingform/
│   │   │   ├── client.ts         # Puntingform API wrapper
│   │   │   ├── types.ts          # API response types
│   │   │   └── cache.ts          # Caching logic for race data
│   │   │
│   │   ├── ai/
│   │   │   ├── wingman.ts        # Wingman agent configuration
│   │   │   ├── prompts.ts        # System prompts and templates
│   │   │   ├── tools.ts          # Agent tools (race lookup, etc.)
│   │   │   └── context.ts        # Context retrieval for RAG
│   │   │
│   │   ├── auth/
│   │   │   ├── config.ts         # NextAuth configuration
│   │   │   └── providers.ts      # Auth provider setup
│   │   │
│   │   └── utils/
│   │       ├── format.ts         # Formatting helpers (odds, money)
│   │       ├── dates.ts          # Date utilities
│   │       └── errors.ts         # Error handling utilities
│   │
│   ├── hooks/                     # Shared hooks only
│   │   ├── use-auth.ts           # Auth session hook
│   │   └── use-local-storage.ts  # Generic storage hook
│   │
│   ├── stores/
│   │   ├── ui-store.ts           # UI state (sidebar, selected race)
│   │   └── bet-store.ts          # In-progress bet state
│   │
│   ├── types/
│   │   ├── race.ts               # Race, Runner, Odds types
│   │   ├── bet.ts                # Bet, BetResult types
│   │   ├── user.ts               # User, Profile types
│   │   └── api.ts                # API response wrapper types
│   │
│   └── middleware.ts             # Auth middleware for protected routes
│
├── tests/
│   ├── integration/
│   │   ├── api-race-cards.test.ts
│   │   ├── api-bets.test.ts
│   │   └── api-chat.test.ts
│   └── fixtures/
│       ├── races.json            # Mock race data
│       └── users.json            # Mock user data
│
└── public/
    ├── favicon.ico
    └── images/
        └── logo.svg
```

### Hook Location Pattern

| Hook Type | Location | Example |
|-----------|----------|---------|
| **Feature-specific** | Co-located with feature | `features/dashboard/use-race-cards.ts` |
| **Shared/reusable** | `/hooks/` | `hooks/use-auth.ts` |

### Design Token Pattern

All theme values (colors, spacing, typography) defined in `tailwind.config.ts`. Components use Tailwind classes, not JS constants.

### Architectural Boundaries

**API Boundaries:**

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/auth/*` | Public | Authentication flows |
| `GET /api/race-cards` | Protected | Today's race meetings |
| `GET /api/races/[id]` | Protected | Race detail + form data |
| `GET/POST /api/bets` | Protected | User's bets |
| `POST /api/chat` | Protected | Wingman conversation |
| `GET /api/user/bankroll` | Protected | Today's spend |

### Data Flow

```
User Action
    │
    ▼
React Component (hooks)
    │
    ▼
API Route (/api/*)
    │
    ├──► Puntingform Client ──► External API
    │
    ├──► MongoDB (lib/db/*) ──► Atlas
    │
    └──► AI Agent (lib/ai/*) ──► LLM Provider
              │
              └──► Context Retrieval (MongoDB Vector Search)
```

### Requirements to Structure Mapping

| Feature | API Routes | Components | Lib/Services |
|---------|------------|------------|--------------|
| **Dashboard** | `/api/race-cards`, `/api/races/[id]` | `features/dashboard/` | `lib/puntingform/` |
| **Wingman** | `/api/chat` | `features/wingman/` | `lib/ai/` |
| **Bet Logging** | `/api/bets` | `features/betting/` | `lib/db/bets.ts` |
| **Bankroll** | `/api/user/bankroll` | `features/bankroll/` | `lib/db/bets.ts` |
| **Auth** | `/api/auth/[...nextauth]` | `features/auth/` | `lib/auth/` |

### Environment Variables Required

```bash
# .env.example

# Database
MONGODB_URI=mongodb+srv://...

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# External APIs
PUNTINGFORM_API_KEY=...
PUNTINGFORM_BASE_URL=https://api.puntingform.com.au

# AI
OPENAI_API_KEY=... (For Embeddings)
GOOGLE_GENERATIVE_AI_API_KEY=... (For Wingman Chat)
```

---

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices work together without conflicts. Next.js 16.x + Vercel + MongoDB Atlas + Vercel AI SDK + NextAuth.js are a proven, compatible stack.

**Pattern Consistency:**
Naming conventions, error handling, and file organization patterns are consistent across all architectural layers (database, API, frontend).

**Structure Alignment:**
Project structure directly supports all architectural decisions. Every feature has a clear home.

### Requirements Coverage Validation ✅

**Functional Requirements:**
- 6/9 FRs fully supported
- 3 FRs explicitly deferred (Sentinels, OAuth, Money Saved)
- All V0 features have complete architectural support

**Non-Functional Requirements:**
- 7/8 NFRs addressed
- Performance targets achievable with chosen stack
- Security requirements met with platform defaults

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical decisions documented with versions
**Structure Completeness:** Complete directory tree with file-level detail
**Pattern Completeness:** Comprehensive naming, error handling, and process patterns

### Gap Analysis Results

**Critical Gaps:** None

**Important Gaps (Covered by Spike):**
- Puntingform API validation
- Results ingestion confirmation
- LLM provider finalization

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** High

**Key Strengths:**
- Clean, modern stack with excellent documentation
- AI-agent optimized (TypeScript, clear patterns)
- Cost-efficient (serverless, free tiers)
- Validated through multiple elicitation techniques

**Technical Spike Required Before Feature Development:**
1. Puntingform API access + coverage validation
2. Display one race card
3. Wingman + racing context test
4. Store bet + reconcile with result

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Step:**
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install ai mongodb next-auth zustand
```
