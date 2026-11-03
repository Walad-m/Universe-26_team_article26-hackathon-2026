# Orvix · Enterprise Order Governance & Burn Radar

Orvix gives enterprise Project Leads real-time visibility into external service provider budgets, burn-down pace, and automated 4-week reorder alerts — with frictionless deliverable-based booking. See [product vision](docs/product-vision.md).

## Prerequisites

| Tool | Version | Check |
|---|---|---|
| Node.js | >= 20.x | `node --version` |
| npm | >= 10.x | `npm --version` |

## Setup

Exact commands, in order, from a fresh clone:

```bash
cp .env.example .env
npm install
npx prisma db push
npm run seed
```

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Test

Run all unit tests with one command:

```bash
npm test
```

## Demo users

| Role | Sign in / View | What to try |
|---|---|---|
| **Project Lead** | `lead@client.de` / `password` | Inspect active order `PO-4500012345`, live Person-Day burn, 4-week reorder radar, and approve/reject proofs of work. |
| **Purchasing** | `purchasing@client.de` / `password` | Aggregated order drawdown view without personal data (Σ), commercial verification, automated 4-week reorder alert. |
| **Consultant Alpha** | `alex@agencyalpha.de` / `password` | Log deliverable hours against assigned order via portal `/portal/contractor-portal-2026`. Enforces German ArbZG § 3 (10h max limit). |

## Evidence map

Where the technical jury finds the evidence for each [technical criterion](docs/scoring.md):

| Criterion | Evidence |
|---|---|
| **1 · Persistence and data model** | [`prisma/schema.prisma`](prisma/schema.prisma), clean baseline challenge seed in [`prisma/seed.ts`](prisma/seed.ts), [ER diagram in docs/domain.md](docs/domain.md) |
| **2 · Business rules and unit tests** | [`app/domain/budget.ts`](app/domain/budget.ts), unit tests in [`tests/budget.test.ts`](tests/budget.test.ts) (accept & reject cases for ArbZG and free budget) |
| **3 · Roles, permissions and privacy** | Server-side RBAC engine in [`app/domain/permissions.ts`](app/domain/permissions.ts), 25 unit tests in [`tests/permissions.test.ts`](tests/permissions.test.ts) (43 total automated tests), [Permission concept in docs/roles-and-privacy.md](docs/roles-and-privacy.md), role-specific views and § 147 AO / DSGVO data minimization |
| **4 · Architecture and engineering** | **Block A (Structure):** `app/` (routes & Server Actions), `app/domain/` (business & permission rules), `prisma/` (persistence entities)<br>**Block B (ADRs):** [docs/adr/](docs/adr/) (ADR 0001 Stack, ADR 0002 Identity, ADR 0003 Operation, ADR 0004 Apple Design Principles)<br>**Block C (Git history):** Commits and PRs distributed across sprint days |

## Team & Scrum Roles

* **Alhassan Mujahid** · **Product Owner (PO)** — Backlog governance, client requirements, commercial prioritization, business pitch.
* **Iddrisu Barkisu** · **Scrum Master (SM)** — Facilitation of standups/sprint reviews/retrospectives, board hygiene, barrier removal, crisis protocol.
* **Muhaysin Muqtar** · **Developer** — Next.js 15 App Router architecture, Server Actions, contractor portal flow, Apple design system.
* **Azinawo Solomon** · **Developer** — German Working Time Act (*ArbZG § 3*) domain logic, budget rules, Vitest automated testing.
* **Bawah Habib** · **Developer** — Prisma SQLite persistence layer, seed automation, German § 147 AO / DSGVO commercial data minimization.
* **Mahabub Abdul Fatawu** · **Developer** — 4-Week Early Warning Reorder Radar, German holiday simulation, German/English (DE/EN) bilingual localization.

## AI Tools Used

* **Google Antigravity & Claude Code**: Agentic pairing for architectural design, ADR authoring, strict TypeScript implementation, Vitest TDD suites, and bilingual localization.
* **GitHub Copilot**: Contextual code completion and interface styling.

## Scrum & Agile Process at a Glance

Our team followed a rigorous two-sprint Scrum cycle, visible on our shared task board and fully documented in [`docs/scrum.md`](docs/scrum.md):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TEAM ORVIX · SCRUM LIFECYCLE (FRIDAY 30 OCT – TUESDAY 3 NOV 2026)                      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 1 (Fri 12:00 – Sun 17:00) · 29 Velocity Points Delivered                        │
│ • Goal: Deliver working walking skeleton (Consultant logs hours -> Order burns down). │
│ • Review: End-to-end flow verified live with PO Alhassan Mujahid.                     │
│ • Retrospective: Identified UI clutter, lack of German i18n, and purchasing privacy.   │
│                                                                                        │
│ SATURDAY CHANGE REQUESTS · PO BACKLOG ADAPTATION                                       │
│ • Business Change (Sabrina): Added "4-Week Early Warning Radar" to Sprint 2.           │
│ • Agile Crisis (Holger): Activated Crisis Playbook (2 slides for containment & repair).│
│                                                                                        │
│ SPRINT 2 (Mon 09:00 – Tue 10:30) · 67 Velocity Points Delivered                        │
│ • Goal: 4-Week Radar, German holiday simulator, § 147 AO privacy, Apple UI, DE/EN i18n│
│ • Review: 43/43 unit tests passing, zero TypeScript errors, full DE/EN localization.   │
│ • Retrospective & DoD: Amended DoD requiring dual-review on all calculation logic.    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Retrospective-to-Backlog Evolution (Continuous Improvement)

In our Scrum process, sprint retrospectives directly shaped the subsequent Product Backlog:

| Retrospective Finding / Change Request | Origin | Agile Action Taken | Backlog Tasks Created & Delivered |
|---|---|---|---|
| **Dark, cluttered UI reduced clarity** | Sprint 1 Retro | Adopted Apple Human Interface Guidelines and monetary-first (€) hierarchy. | **TSK-21, TSK-22, TSK-23** ([ADR 0004](docs/adr/0004-ui-design-system-apple-principles.md)) |
| **German enterprise users need native language** | Sprint 1 Retro | Built comprehensive English / German bilingual localization. | **TSK-24, TSK-25, TSK-26** (`LanguageContext.tsx`) |
| **Purchasing saw private contractor details** | Sprint 1 Retro | Built § 147 AO / DSGVO commercial data minimization RBAC engine. | **TSK-17, TSK-18, TSK-19** (`permissions.ts`) |
| **Unforeseen 4-week reorder delay** | Saturday Change 1 | Built 4-Week Reorder Radar factoring in German public holiday freezes. | **TSK-13, TSK-14** (`computeOrderForecast()`) |
| **Calculation vulnerability in production** | Saturday Change 2 | Amended Definition of Done (DoD) to mandate financial property tests. | **TSK-27, TSK-28, TSK-29** ([docs/scrum.md](docs/scrum.md)) |

## Hackathon Hand-In Deliverables

* **Agile & Scrum Master Documentation:** [`docs/scrum.md`](docs/scrum.md) — Working agreement, 30-task master backlog, sprint execution, task board state, and the 2-slide Agile Crisis response.
* **One-Page Summary Sheet:** [`docs/summary-sheet.md`](docs/summary-sheet.md) — Hand-in PDF one-liners per Slide 20 of Hackathon Handbook.
* **Video Presentation & Demo Scripts:** [`docs/pitch-and-presentation.md`](docs/pitch-and-presentation.md) — Word-for-word spoken scripts: Business Pitch (2:30), Technical Demo (2:30), and Agile Crisis (1:00, exactly 2 slides).
