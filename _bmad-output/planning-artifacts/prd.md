---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-non-functional', 'step-11-complete']
inputDocuments: ['_bmad-output/planning-artifacts/product-brief-Current Project-2026-02-04.md']
classification:
  projectType: Web App
  domain: Wagering / Fintech
  complexity: High
  projectContext: Greenfield
---

# Product Requirements Document (PRD): Current Project

## 1. Executive Summary

### 1.1 Product Vision
To create the **"Strava for Punters"** — an AI-native strategic intelligence platform that transforms horse racing from a fragmented, transactional gambling experience into a gamified journey of mastery and discipline.

### 1.2 Target Audience
*   **Salty Sam (The Pro-Am):** Seeking efficiency and a data edge.
*   **Aspiring Arthur (The Improver):** Seeking education and validation of his ideas.
*   **Casual Cathy (The Social Punter):** Seeking entertainment and a safety net for her bankroll.

### 1.3 Key Objectives (OKRs)
*   **Objective:** Become the primary "Homebase" for the Discord generation of punters.
*   **Key Result 1:** D30 Retention > 40%.
*   **Key Result 2:** >30% of users logging bets (manual or auto) to track "Saved Capital."
*   **Key Result 3:** >60% of user base under the age of 35.

---

## 2. Product Scope

### 2.1 In Scope (MVP)
1.  **Unified Racing Dashboard:** Consolidated Race Cards (AU) and Form.
2.  **AI Wingman (The Coach):** Conversational risk assessment and form interrogation.
3.  **Conditional Blackbook:** Sentinel alerts based on specific track/odds conditions.
4.  **Bookmaker OAuth:** Automated P&L and transaction syncing (Entain/TAB).
5.  **Gamified Bankroll:** Health Bars, Discipline Streaks, and "Money Saved" tracking.
6.  **Smart Deep-Links:** One-tap navigation to bookmaker bet slips and official replays.

### 2.2 Out of Scope
*   Direct wagering (placing bets inside the app).
*   Native embedded video streaming (licensing).
*   Syndicate/Social group betting.
*   International data (outside AU/NZ).

### 2.3 Future Roadmap
*   **Phase 2:** Deep AI Post-Mortems (Behavioral analysis), Agent Persona Marketplace, NZ Data.
*   **Phase 3:** Native Video Player, Strategy Store (User-created agents), Global Markets.

---

## 3. User Personas & User Journeys

### 3.1 Primary Personas
*   **Salty Sam:** Professional-grade tools, efficiency, high-density data.
*   **Aspiring Arthur:** Mentorship, risk flagging, educational insights.
*   **Casual Cathy:** Gamification, mobile-first, safety/responsible gambling.

### 3.2 Key User Journeys
*   **The Saturday War Room:** Using the dashboard to execute a pre-planned strategy.
*   **The "Why" Investigation:** Using the AI Wingman to de-risk a potential bet.
*   **The Discipline Loop:** Maintaining streaks and checking "Money Saved" during off-days.

---

## 4. Functional Requirements

### 4.1 Data & Dashboard
*   **FR1:** The system shall aggregate race cards, form, and odds from Puntingform API.
*   **FR2:** The system shall provide a unified view for all Australian racing jurisdictions.
*   **FR3:** The system shall support "Conditional Sentinels" (If Horse X + Condition Y, then Alert).

### 4.2 AI Wingman (Conversational Interface)
*   **FR4:** The system shall provide a chat interface for natural language querying of form data.
*   **FR5:** The AI shall proactively flag risks (e.g., track bias, barrier stats) when a user selects a horse.
*   **FR6:** The AI shall support a "Negative/Skeptical" mode to challenge user assumptions.

### 4.3 Wagering & Bankroll
*   **FR7:** The system shall integrate with Bookmaker OAuth (Entain/TAB) for P&L syncing.
*   **FR8:** The system shall visualize bankroll as a "Health Bar" based on user-defined staking plans.
*   **FR9:** The system shall calculate and display "Money Saved" (User Intent = Bet + AI Advice = No + Result = Loss).

---

## 5. Non-Functional Requirements

### 5.1 Performance
*   **NFR1:** AI Wingman initial response latency shall be < 3 seconds.
*   **NFR2:** Dashboard data (Odds) shall refresh with < 5s latency (WebSocket priority).
*   **NFR3:** LCP < 2.5s on 4G mobile connections.

### 5.2 Security & Privacy
*   **NFR4:** All user P&L and transaction data shall be encrypted at rest.
*   **NFR5:** OAuth tokens shall be stored in a secure vault (e.g., AWS Secrets Manager).
*   **NFR6:** Mandatory age-gating (18+) on user registration.

### 5.3 Reliability
*   **NFR7:** System shall have a "Polling Fallback" if WebSocket connections fail.
*   **NFR8:** 99.9% uptime for the primary data ingestion engine.

---

## 6. Data Requirements

### 6.1 Data Models
*   **User Profile:** Auth, Settings, Persona preferences.
*   **Bankroll Log:** Transactions, Staking history, Streaks.
*   **Context DB:** Track bias, Barrier stats, Trainer/Jockey metrics (for AI querying).
*   **Sentinels:** User-defined alert triggers.

### 6.2 Data Retention
*   Transaction data retained for the life of the account for "Sunday Post-Mortem" analysis.

---

## 7. UX/UI Requirements

### 7.1 Design Guidelines
*   **Aesthetics:** "Tuxedo UI" (Dark Mode, Gold/Obsidian accents) for a premium, high-stakes feel.
*   **Mobile-First:** PWA optimized for one-handed operation at the track.

### 7.2 Key Screens
*   **Command Center:** The primary racing dashboard.
*   **Wingman Sidebar:** Persistent chat interface.
*   **The Vault:** Bankroll, P&L, and Discipline stats.

---

## 8. Go-to-Market Strategy

### 8.1 Launch Plan
*   **Beta:** Invite-only launch for "Salty Sam" power users.
*   **Public:** Launch coinciding with a major carnival (e.g., Spring Carnival).

### 8.2 Success Metrics (KPIs)
*   **Primary:** "Session Intensity" (Frequency of check-ins during race meetings).
*   **Secondary:** Affiliate Click-Through Rate (Launchpad Velocity).

---

## 9. Riskiest Assumptions & Validation
1.  **Assumption:** Punters will value "Education" and "Discipline" over "Tips."
    *   *Validation:* Measure usage of the "Money Saved" feature and "Wingman" interrogation.
2.  **Assumption:** We can maintain high-speed odds/video links without official streaming licenses.
    *   *Validation:* Technical prototype of deep-linking to Racing.com/Sky replays.
