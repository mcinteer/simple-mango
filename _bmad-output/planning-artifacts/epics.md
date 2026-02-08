---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md']
---

# simple-mango - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for simple-mango, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: The system shall aggregate race cards, form, and odds from Puntingform API.
FR2: The system shall provide a unified view for all Australian racing jurisdictions.
FR3: The system shall support "Conditional Sentinels" (If Horse X + Condition Y, then Alert).
FR4: The system shall provide a chat interface for natural language querying of form data.
FR5: The AI shall proactively flag risks (e.g., track bias, barrier stats) when a user selects a horse.
FR6: The AI shall support a "Negative/Skeptical" mode to challenge user assumptions.
FR7: The system shall integrate with Bookmaker OAuth (Entain/TAB) for P&L syncing.
FR8: The system shall visualize bankroll as a "Health Bar" based on user-defined staking plans.
FR9: The system shall calculate and display "Money Saved" (User Intent = Bet + AI Advice = No + Result = Loss).

### NonFunctional Requirements

NFR1: AI Wingman initial response latency shall be < 3 seconds.
NFR2: Dashboard data (Odds) shall refresh with < 5s latency (WebSocket priority).
NFR3: LCP < 2.5s on 4G mobile connections.
NFR4: All user P&L and transaction data shall be encrypted at rest.
NFR5: OAuth tokens shall be stored in a secure vault (e.g., AWS Secrets Manager).
NFR6: Mandatory age-gating (18+) on user registration.
NFR7: System shall have a "Polling Fallback" if WebSocket connections fail.
NFR8: 99.9% uptime for the primary data ingestion engine.

### Additional Requirements

**Architecture Requirements:**
- **Starter Template**: `create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` (Already executed in Spike)
- **Tech Stack**: Next.js 16.x (App Router), TypeScript 5.x, Tailwind CSS 3.x, Vercel AI SDK, MongoDB Atlas (Native Driver), NextAuth.js
- **Pattern**: Hybrid schema (embed + reference) for MongoDB
- **Real-time**: SSE for AI, Polling for odds (WebSockets deferred for V1)
- **Cost**: Serverless-first, Free-tier friendly
- **Money Handling**: Integer cents (2500 = $25.00)
- **Date Handling**: ISO 8601 strings in API
- **API**: Next.js API Routes (`/src/app/api/`)
- **Validation**: Puntingform API integration validated in Spike
- **AI Model**: Google Gemini `gemini-2.0-flash` (Validated in Spike)
- **Authentication**: NextAuth.js with Google + Email/Password, Age-gating (18+)

**Scope Adjustments (Architecture vs PRD):**
- **FR3 (Sentinels)**: Deferred for V0/MVP (per Architecture)
- **FR7 (Bookmaker OAuth)**: Descoped for V0/MVP (Manual logging only)
- **FR8 (Health Bar)**: Passive display only for V0
- **NFR2 (WebSockets)**: Polling strategy selected for MVP simplicity
- **NFR5 (OAuth Tokens)**: Not applicable (OAuth descoped)

**UX Requirements (Implied from Architecture/PRD):**
- **Theme**: "Tuxedo UI" (Dark Mode, Gold/Obsidian accents)
- **Responsive**: Mobile-first PWA design
- **Navigation**: Collapsible Wingman sidebar
- **Loading**: Skeleton states for race cards

### FR Coverage Map

FR1: Epic 1 - Aggregates Puntingform data
FR2: Epic 1 - Unified dashboard view
FR3: Deferred
FR4: Epic 2 - Chat interface
FR5: Epic 2 - Risk flagging
FR6: Epic 2 - Skeptical mode
FR7: Descoped
FR8: Epic 3 - Bankroll visualization
FR9: Epic 3 - Money Saved calculation

## Epic List

### Epic 1: Foundation & Racing Intelligence
Establish the core platform, user identity, and the "Command Center" dashboard with real-time racing data.
**FRs covered:** FR1, FR2, NFR2, NFR3, NFR6

### Epic 2: The AI Wingman
Activate the "Coach" — the conversational interface that turns data into insights.
**FRs covered:** FR4, FR5, FR6, NFR1

### Epic 3: Bankroll & Discipline
Close the loop by allowing users to track their performance and visualize their discipline.
**FRs covered:** FR9, FR8, NFR4

## Epic 1: Foundation & Racing Intelligence

Establish the core platform, user identity, and the "Command Center" dashboard with real-time racing data.

### Story 1.1: Project Initialization & Auth

As a new user,
I want to register for an account and confirm I am 18+,
So that I can access the racing dashboard legally and securely.

**Acceptance Criteria:**

**Given** the user is on the landing page
**When** they click "Sign Up"
**Then** they see a registration form with Email/Password and a "Google Sign-In" option
**And** there is a mandatory checkbox "I confirm I am 18 years of age or older"
**And** submitting without the checkbox checked shows an error
**And** successful registration creates a `users` document in MongoDB
**And** the user is redirected to the dashboard (`/dashboard`)

### Story 1.2: Puntingform Client & Caching

As a developer (on behalf of the user),
I want the system to cache racing data,
So that the dashboard loads fast and we don't exceed API rate limits.

**Acceptance Criteria:**

**Given** the application is running
**When** a request is made for `/api/race-cards`
**Then** the system checks MongoDB for valid cached data (TTL < 1 hour)
**And** if valid, it returns the cached data immediately
**And** if invalid/missing, it fetches from Puntingform API `/meetingslist`, saves to MongoDB, and returns the data
**And** Puntingform API keys are loaded securely from environment variables

### Story 1.3: Dashboard & Meeting List

As a user,
I want to see all today's race meetings grouped by state,
So that I can quickly find the race I want to bet on.

**Acceptance Criteria:**

**Given** the user is logged in
**When** they visit `/dashboard`
**Then** they see a list of today's Australian race meetings
**And** meetings are grouped by State (VIC, NSW, QLD, etc.)
**And** each meeting card shows the Track Name and Start Time of the first race
**And** the UI follows the "Tuxedo" dark mode aesthetic

### Story 1.4: Race Card Detail View

As a user,
I want to see the runners and form for a specific race,
So that I can assess the field.

**Acceptance Criteria:**

**Given** the user clicks on a Meeting
**When** they select a specific Race Number
**Then** they are navigated to `/race/[id]`
**And** they see the full list of Runners, Jockeys, Trainers, and Barrier Draws
**And** basic form statistics (Last 5 starts) are visible for each runner
**And** the page uses a Skeleton loader while fetching data

### Story 1.5: Real-time Odds Polling

As a user,
I want to see up-to-date odds on the race card,
So that I know the current market price.

**Acceptance Criteria:**

**Given** the user is viewing a Race Card
**When** they remain on the page
**Then** the odds update automatically every 10 seconds without refreshing the page
**And** if the fetch fails, it silently retries without breaking the UI
**And** if the race is "Closed" or "Jumped", polling stops

### Story 1.6: Theme Toggle (Light/Dark Mode)

As a user,
I want to switch between light and dark themes,
So that I can use the app comfortably in different lighting conditions.

**Acceptance Criteria:**

**Given** the user is on any page
**When** they click the theme toggle
**Then** the UI switches between light and dark mode immediately
**And** their preference is persisted in localStorage
**And** the default theme is dark ("Tuxedo" aesthetic)
**And** the toggle is accessible (keyboard navigable, proper ARIA labels)

## Epic 2: The AI Wingman

Activate the "Coach" — the conversational interface that turns data into insights.

### Story 2.1: Wingman Chat Interface

As a user,
I want a chat sidebar available on every screen,
So that I can ask for advice without losing my place.

**Acceptance Criteria:**

**Given** the user is on the Dashboard or Race Card
**When** they click the "Wingman" icon
**Then** a sidebar slides out from the right
**And** they can type a message and press Enter
**And** the message appears immediately in the chat history
**And** a streaming response from the AI starts appearing within 3 seconds (NFR1)

### Story 2.2: Racing Context RAG Pipeline

As a user,
I want the AI to know which race I am looking at,
So that I don't have to copy-paste form data into the chat.

**Acceptance Criteria:**

**Given** the user is viewing Race 4 at Flemington
**When** they ask "Who is the favorite?"
**Then** the AI answers specifically about Race 4 at Flemington
**And** the system prompt automatically includes the JSON data of the current race runners and form
**And** the AI does NOT hallucinate runners that are not in the field

### Story 2.3: Risk Assessment Skill

As a user,
I want the AI to warn me about risks,
So that I don't bet on a "false favorite".

**Acceptance Criteria:**

**Given** the user asks "What do you think of Horse X?"
**When** the AI analyzes the form
**Then** it specifically checks for "Track Bias" (e.g., Wide Barrier on tight track) or "First Up" stats
**And** if a risk is found, it starts the response with a "⚠️ Risk Alert"
**And** it provides a balanced reasoning for the risk

### Story 2.4: Skeptical Mode Toggle

As a user,
I want to switch Wingman into "Skeptical Mode",
So that it challenges my confirmation bias.

**Acceptance Criteria:**

**Given** the chat sidebar is open
**When** I toggle the "Skeptical Mode" switch
**Then** the AI's personality shifts to be more critical and risk-averse
**And** it actively looks for reasons *not* to bet
**And** the UI indicates this mode is active (e.g., Red border or icon)

## Epic 3: Bankroll & Discipline

Close the loop by allowing users to track their performance and visualize their discipline.

### Story 3.1: Bet Logging Schema & Form

As a user,
I want to manually log a bet I placed with a bookie,
So that I can track my performance in the app.

**Acceptance Criteria:**

**Given** the user is on a Race Card
**When** they click "Log Bet" on a runner
**Then** a modal appears pre-filled with the Race and Horse details
**And** the user inputs the "Stake" (in dollars) and "Odds" (decimal)
**And** clicking "Save" stores the bet in the `bets` collection
**And** the Money is stored as integer cents (e.g., $50 = 5000)

### Story 3.2: The Vault (Bankroll) UI

As a user,
I want to see my "Health Bar" and P&L,
So that I know if I am winning or losing.

**Acceptance Criteria:**

**Given** the user clicks "The Vault" in the navigation
**When** the page loads
**Then** they see a "Health Bar" visual representing their bankroll status
**And** they see a list of their recent bets
**And** they see a summary of Today's Spend vs. Limits

### Story 3.3: Result Reconciliation Logic

As a user,
I want my logged bets to automatically update as Win/Loss,
So that I don't have to manually grade them.

**Acceptance Criteria:**

**Given** a bet is logged with status "PENDING"
**When** the race is resulted in Puntingform (via API check)
**Then** the system matches the result to the bet
**And** updates the bet status to "WIN" or "LOSS"
**And** calculates the Return (Stake * Odds for Win, 0 for Loss)

### Story 3.4: "Money Saved" Calculation

As a user,
I want to see how much money I saved by listening to Wingman,
So that I feel good about *not* betting.

**Acceptance Criteria:**

**Given** a user asks about a horse
**And** Wingman advises against it (Risk Alert)
**And** the user does NOT log a bet on that horse
**And** that horse subsequently loses the race
**When** the race is resulted
**Then** the system calculates a "Money Saved" value (based on user's average stake)
**And** displays this in The Vault as a positive metric
