# Story 1.1: Project Initialization & Auth

Status: done

## Story

As a new user,
I want to register for an account and confirm I am 18+,
so that I can access the racing dashboard legally and securely.

## Acceptance Criteria

1. **Given** the repo is empty, **When** the dev runs the init command, **Then** a working Next.js app with TypeScript, Tailwind, ESLint, App Router, and `/src` directory exists.
2. **Given** the app is initialized, **When** dependencies are installed, **Then** `ai`, `mongodb`, `next-auth`, and `zustand` are in `package.json`.
3. **Given** the user visits the landing page, **When** they click "Sign Up", **Then** they see a registration form with Email/Password fields and a "Sign in with Google" button.
4. **Given** the registration form is displayed, **When** a user submits without checking "I confirm I am 18 years of age or older", **Then** an inline error prevents submission.
5. **Given** valid registration details + age confirmation, **When** submitted, **Then** a `users` document is created in MongoDB and the user is redirected to `/dashboard`.
6. **Given** a registered user, **When** they visit `/login`, **Then** they can sign in with Email/Password or Google OAuth.
7. **Given** an unauthenticated user, **When** they try to access `/dashboard`, **Then** they are redirected to `/login`.
8. **Given** the app is running, **When** any page loads, **Then** the "Tuxedo UI" dark theme (dark background, gold/obsidian accents) is applied globally.

## Tasks / Subtasks

- [x] **Task 1: Project Initialization** (AC: #1, #2)
  - [x] Run `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"`
  - [x] Run `npm install ai mongodb next-auth zustand`
  - [x] Create `.env.example` with all required env var keys (see Dev Notes)
  - [x] Verify `.env.local` already exists with real credentials
  - [x] Verify `npm run dev` starts without errors

- [x] **Task 2: MongoDB Connection Singleton** (AC: #5)
  - [x] Create `/src/lib/db/client.ts` — MongoDB native driver connection singleton
  - [x] Use global cache pattern to prevent multiple connections in dev (hot reload)
  - [x] Read `MONGODB_URI` from `process.env`
  - [x] Export `getDb()` helper returning the database instance

- [x] **Task 3: NextAuth.js Configuration** (AC: #3, #5, #6, #7)
  - [x] Create `/src/lib/auth/config.ts` — NextAuth configuration
  - [x] Create `/src/lib/auth/providers.ts` — Google OAuth + Credentials provider
  - [x] Create `/src/app/api/auth/[...nextauth]/route.ts` — NextAuth API handler
  - [x] Configure JWT session strategy (stateless, Vercel-friendly)
  - [x] Credentials provider: validate email/password, check `users` collection
  - [x] Google provider: use `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
  - [x] On sign-up, store user in `users` collection with `{ email, name, ageVerified: true, createdAt }`
  - [x] Hash passwords with bcrypt (add `bcryptjs` dependency)

- [x] **Task 4: Auth Middleware** (AC: #7)
  - [x] Create `/src/middleware.ts` — protect all `/(auth)/*` routes
  - [x] Redirect unauthenticated users to `/login`
  - [x] Allow public access to `/`, `/login`, `/register`, `/api/auth/*`

- [x] **Task 5: Registration Page + Age Gate** (AC: #3, #4, #5)
  - [x] Create `/src/app/register/page.tsx`
  - [x] Create `/src/components/features/auth/register-form.tsx`
  - [x] Create `/src/components/features/auth/age-gate.tsx` — checkbox component
  - [x] Form fields: name, email, password, confirm password, age-gate checkbox
  - [x] Client-side validation: all fields required, password match, checkbox checked
  - [x] On submit: call registration API, then `signIn('credentials')` and redirect to `/dashboard`

- [x] **Task 6: Login Page** (AC: #6)
  - [x] Create `/src/app/login/page.tsx`
  - [x] Create `/src/components/features/auth/login-form.tsx`
  - [x] Email/Password form + "Sign in with Google" button
  - [x] On success: redirect to `/dashboard`

- [x] **Task 7: Registration API Route** (AC: #5)
  - [x] Create `/src/app/api/auth/register/route.ts` — POST handler
  - [x] Validate input (email format, password length >= 8, ageVerified === true)
  - [x] Check for existing user by email
  - [x] Hash password, insert into `users` collection
  - [x] Return `{ data: { id, email } }` on success
  - [x] Return `{ error: { code: "CONFLICT", message: "..." } }` if email exists

- [x] **Task 8: Tuxedo Theme + Layout** (AC: #8)
  - [x] Update `tailwind.config.ts` — extend colors: `gold: '#D4AF37'`, `obsidian: '#0B1215'`, dark palette
  - [x] Update `/src/app/globals.css` — dark background, gold accent text
  - [x] Create `/src/app/layout.tsx` — root layout with dark theme, font, auth session provider
  - [x] Create `/src/app/(auth)/layout.tsx` — protected layout (nav placeholder, content area)
  - [x] Create `/src/app/(auth)/dashboard/page.tsx` — placeholder: "Welcome, {user.name}!"
  - [x] Create `/src/app/page.tsx` — landing page with links to `/login` and `/register`

- [x] **Task 9: Basic UI Primitives** (AC: #3, #6)
  - [x] Create `/src/components/ui/button.tsx` — styled button (gold accent, dark bg variants)
  - [x] Create `/src/components/ui/input.tsx` — styled text input (dark theme)
  - [x] Create `/src/components/ui/card.tsx` — container card component
  - [x] Create `/src/components/ui/index.ts` — barrel export

## Dev Notes

### Tech Stack & Versions
- **Next.js**: Latest stable (16.x expected) with App Router
- **TypeScript**: 5.x
- **Tailwind CSS**: 3.x (comes with create-next-app)
- **NextAuth.js**: `next-auth@4.24.x` — use v4, NOT v5/Auth.js (v5 has breaking changes)
- **MongoDB**: `mongodb@6.x` native driver — do NOT use Mongoose or Prisma
- **Additional**: `bcryptjs` for password hashing (pure JS, no native deps)

### Critical Architecture Patterns

**MongoDB Connection (`/src/lib/db/client.ts`):**
```typescript
import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;
let client: MongoClient;
let db: Db;

if (process.env.NODE_ENV === 'development') {
  const globalWithMongo = global as typeof globalThis & { _mongoClient?: MongoClient };
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri);
  }
  client = globalWithMongo._mongoClient;
} else {
  client = new MongoClient(uri);
}

export async function getDb(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db('simple-mango');
  }
  return db;
}
```

**API Response Format — MANDATORY:**
- Success: `{ data: T }`
- Error: `{ error: { code: string, message: string, details?: unknown } }`
- Use standard HTTP codes: 400, 401, 409, 500

**Naming Conventions:**
- Files: kebab-case (`register-form.tsx`)
- Components: PascalCase (`RegisterForm`)
- DB collections: camelCase plural (`users`)
- DB fields: camelCase (`createdAt`, `ageVerified`)
- Functions: camelCase (`getDb`, `hashPassword`)

**Money Format:** Integer cents (`2500` = $25.00) — not relevant for this story but set the pattern.

**Date Format:** ISO 8601 strings in all API responses and DB documents.

### NextAuth.js Configuration Notes

- Use `CredentialsProvider` for email/password
- Use `GoogleProvider` for OAuth
- Session strategy: `jwt` (NOT database sessions)
- The `authorize` function in Credentials provider must query MongoDB `users` collection
- On Google sign-in, use the `signIn` callback to upsert user into `users` collection with `ageVerified: false` initially — then require age verification on first dashboard visit (or handle in registration flow)
- **Important**: Google OAuth users still need age verification. Handle this with a redirect check in the `(auth)` layout.

### Environment Variables (`.env.example`)
```bash
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/simple-mango

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# External APIs (not needed for this story)
PUNTINGFORM_API_KEY=
PUNTINGFORM_BASE_URL=https://api.puntingform.com.au

# AI (not needed for this story)
GOOGLE_GENERATIVE_AI_API_KEY=
```

### File Structure for This Story
```
src/
├── app/
│   ├── globals.css              # Tuxedo theme styles
│   ├── layout.tsx               # Root layout + SessionProvider
│   ├── page.tsx                 # Landing page
│   ├── login/page.tsx           # Login page
│   ├── register/page.tsx        # Registration page
│   ├── (auth)/
│   │   ├── layout.tsx           # Protected layout
│   │   └── dashboard/page.tsx   # Placeholder dashboard
│   └── api/
│       └── auth/
│           ├── [...nextauth]/route.ts  # NextAuth handler
│           └── register/route.ts       # Registration endpoint
├── components/
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── index.ts
│   └── features/
│       └── auth/
│           ├── register-form.tsx
│           ├── login-form.tsx
│           ├── age-gate.tsx
│           └── index.ts
├── lib/
│   ├── db/client.ts             # MongoDB singleton
│   └── auth/
│       ├── config.ts            # NextAuth config
│       └── providers.ts         # Auth providers
├── types/
│   ├── user.ts                  # User type definitions
│   └── api.ts                   # API response types
└── middleware.ts                 # Route protection
```

### Type Definitions

**`/src/types/user.ts`:**
```typescript
export interface User {
  _id?: string;
  email: string;
  name: string;
  passwordHash?: string;  // undefined for OAuth users
  provider: 'credentials' | 'google';
  ageVerified: boolean;
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}
```

**`/src/types/api.ts`:**
```typescript
export interface ApiSuccess<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

### Testing Approach
- Co-locate unit tests with source: `register-form.test.tsx` next to `register-form.tsx`
- Integration tests in `/tests/integration/`
- For this story: manual testing is acceptable; test infrastructure comes later
- Verify: registration flow, login flow, route protection, Google OAuth redirect

### Anti-Patterns to Avoid
- ❌ Do NOT use Prisma or Mongoose — use `mongodb` native driver only
- ❌ Do NOT use NextAuth v5 / Auth.js — use `next-auth@4.24.x`
- ❌ Do NOT create `/pages/api/` routes — use App Router `/app/api/`
- ❌ Do NOT store passwords in plain text
- ❌ Do NOT skip the age-gate checkbox validation
- ❌ Do NOT use `"use client"` on every component — prefer Server Components, only mark client where needed (forms, interactivity)
- ❌ Do NOT put feature-specific hooks in `/hooks/` — co-locate with feature

### Spike Learnings (Context from Previous Validation)
- MongoDB Atlas connection works — whitelist `0.0.0.0/0` for Vercel serverless
- `.env.local` already has `MONGODB_URI`, `PUNTINGFORM_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `NEXTAUTH_SECRET`
- Google OAuth credentials (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`) still need to be set up in Google Cloud Console
- Gemini validated as AI model but not relevant for this story

### Project Structure Notes
- This is Story 1.1 — the foundation. All subsequent stories build on this.
- The `(auth)` route group pattern is critical — all protected pages go under it.
- The dashboard placeholder will be expanded in Story 1.3.
- UI primitives created here will be reused across all future stories.

### References
- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Environment Variables Required]
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1]
- [Source: _bmad-output/planning-artifacts/prd.md#NFR6 Age-Gating]
- [Source: _bmad-output/spike-handoff-barry.md#Spike Results]

## Dev Agent Record

### Agent Model Used
Claude (Anthropic) via pi coding agent

### Debug Log References
- Next.js 16 uses Tailwind v4 with CSS-based `@theme` config instead of `tailwind.config.ts` — colors defined in `globals.css`
- Next.js 16 deprecated `export { default } from "next-auth/middleware"` pattern — rewrote middleware with explicit `getToken` + `NextResponse.redirect`
- Added `bcryptjs` + `@types/bcryptjs` as additional dependency for password hashing (noted in story Dev Notes)

### Completion Notes List
- All 9 tasks implemented and verified via `npm run build` (clean) and `npm run lint` (clean)
- Story Dev Notes specify manual testing acceptable for this story; test infrastructure comes in later stories
- Tailwind config adapted for v4 (CSS `@theme` block) since Next.js 16 ships Tailwind v4
- Google OAuth upserts user with `ageVerified: false` — age verification for OAuth users to be handled in future story
- Middleware warning about deprecated convention is cosmetic; functionality works correctly

### Review Follow-ups (AI)
- [x] [AI-Review][Critical] Missing age verification check in `middleware.ts` (redirects unverified users to home)
- [x] [AI-Review][Critical] Missing `ageVerified` in session/JWT to support middleware check
- [x] [AI-Review][Medium] Email case sensitivity handling in registration and login
- [x] [AI-Review][Low] Env var safety check in `db/client.ts`

### Change Log
- 2026-02-07: Implemented all 9 tasks — project init, MongoDB singleton, NextAuth config, middleware, registration, login, API routes, Tuxedo theme, UI primitives
- 2026-02-07: Code Review Fixes - Implemented email normalization, robust env checking, and age verification enforcement in middleware.

### File List
- .env.example
- src/app/globals.css
- src/app/layout.tsx
- src/app/page.tsx
- src/app/login/page.tsx
- src/app/register/page.tsx
- src/app/(auth)/layout.tsx
- src/app/(auth)/dashboard/page.tsx
- src/app/api/auth/[...nextauth]/route.ts
- src/app/api/auth/register/route.ts
- src/components/features/auth/age-gate.tsx
- src/components/features/auth/register-form.tsx
- src/components/features/auth/login-form.tsx
- src/components/features/auth/index.ts
- src/components/providers/session-provider.tsx
- src/components/ui/button.tsx
- src/components/ui/input.tsx
- src/components/ui/card.tsx
- src/components/ui/index.ts
- src/lib/auth/config.ts
- src/lib/auth/providers.ts
- src/lib/db/client.ts
- src/middleware.ts
- src/types/api.ts
- src/types/user.ts
