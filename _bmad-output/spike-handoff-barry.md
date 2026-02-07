# Technical Spike Handoff for Barry

**Created:** 2026-02-06
**From:** Winston (Architect)
**To:** Barry (Quick Flow Solo Dev)

---

## Project Context

**Project:** AI-native horse racing platform ("Strava for Punters")
**Codename:** simple-mango

We've completed architecture with Winston. Now we need to validate key assumptions before building features.

**Read the full architecture:** `_bmad-output/planning-artifacts/architecture.md`

---

## Your Mission

Run a technical spike to prove our stack works with real data. This is exploratory — ship fast, document what works and what doesn't.

---

## Spike Tasks

### 1. Project Initialization
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
npm install ai mongodb next-auth zustand
```

Set up `.env.local` with the provided credentials.

### 2. Puntingform API Validation

**Goal:** Confirm we can fetch racing data

**Docs:** https://docs.puntingform.com.au/reference/meetingslist

**Tasks:**
- [ ] Create `/src/lib/puntingform/client.ts`
- [ ] Fetch today's meetings from `/meetingslist`
- [ ] Fetch a single race with form data
- [ ] Confirm results endpoint exists (for bet reconciliation)
- [ ] Document rate limits and any gotchas

**Success:** Can fetch race cards and form data programmatically

### 3. MongoDB Connection

**Goal:** Confirm Atlas connection and basic CRUD

**Tasks:**
- [ ] Create `/src/lib/db/client.ts` with connection singleton
- [ ] Create a test collection, insert a document, read it back
- [ ] Confirm vector search is available on the cluster

**Success:** Can read/write to MongoDB from Next.js API routes

### 4. Wingman LLM Test

**Goal:** Confirm Vercel AI SDK streaming works with racing context

**Tasks:**
- [ ] Create `/src/lib/ai/wingman.ts` with basic agent config
- [ ] Create `/src/app/api/chat/route.ts` with streaming response
- [ ] Make one test call: "What should I look for when betting on wet tracks?"
- [ ] Confirm streaming works in browser

**Success:** Streaming AI response renders in real-time

### 5. Bet Storage + Result Reconciliation

**Goal:** Confirm we can log a bet and match it to a result

**Tasks:**
- [ ] Create `/src/lib/db/bets.ts` with create/read functions
- [ ] Store a mock bet: `{ oddsraceId, selection, stake, createdAt }`
- [ ] Fetch a race result from Puntingform
- [ ] Match bet to result, calculate P&L

**Success:** Can store bet and determine win/loss from result data

---

## Environment Variables Needed

```bash
# .env.local

# MongoDB
MONGODB_URI=mongodb+srv://...

# Puntingform
PUNTINGFORM_API_KEY=...
PUNTINGFORM_BASE_URL=https://api.puntingform.com.au

# AI (OpenAI or alternative)
OPENAI_API_KEY=...

# Auth (can skip for spike, but needed later)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=spike-secret-temp
```

---

## Architecture Patterns to Follow

From the architecture doc:

**File naming:** kebab-case (`puntingform-client.ts`)
**Collections:** camelCase, plural (`users`, `bets`)
**API responses:** `{ data: T }` or `{ error: { code, message } }`
**Money:** Integer cents (2500 = $25.00)

---

## Output Required

When done, update this file with:

### Spike Results

| Task | Status | Notes |
|------|--------|-------|
| Project init | ✅ | Next.js 15, Tailwind, TS setup complete. |
| Puntingform API | ✅ | Validated. `results` endpoint serves as race card. |
| MongoDB connection | ✅ | Connected to Atlas (whitelist fixed). CRUD verified. |
| Wingman LLM | ✅ | Streaming works with `gemini-2.0-flash`. |
| Bet reconciliation | ✅ | Logic verified: Store bet -> Fetch result -> Calculate PnL. |

### Blockers Found

None. All cleared.

### Architecture Adjustments Needed

1. **Race Card Strategy:** Use `/v2/form/results?meetingId=...` to fetch race details (runners, odds).
2. **AI Model:** Confirmed `gemini-2.0-flash` is the working model for this project.



---

## Questions?

Refer to `_bmad-output/planning-artifacts/architecture.md` for all patterns and decisions.

If something is ambiguous, make a pragmatic choice and document it.

Ship fast. 🚀
