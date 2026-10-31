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
| **Project Lead** | `lead@client.de` / `password` | Inspect active order `PO-4500012345`, live Person-Day burn, 4-week reorder radar, and approvals. |
| **Purchasing** | `purchasing@client.de` / `password` | Aggregated order drawdown view without personal data, automated 4-week reorder alert. |
| **Consultant Alpha** | `consultant@supplier-a.de` / `password` | Log deliverable hours against assigned order. Enforces German Working Time Act (ArbZG 10h limit). |
| **Consultant Beta** | `consultant@supplier-b.de` / `password` | Agency Beta portal with strict vendor isolation (cannot view Agency Alpha's orders). |

## Evidence map

Where the technical jury finds the evidence for each [technical criterion](docs/scoring.md):

| Criterion | Evidence |
|---|---|
| **1 · Persistence and data model** | [`prisma/schema.prisma`](prisma/schema.prisma), [`prisma/seed.ts`](prisma/seed.ts), [ER diagram in docs/domain.md](docs/domain.md) |
| **2 · Business rules and unit tests** | [`app/domain/budget.ts`](app/domain/budget.ts), unit tests in [`tests/budget.test.ts`](tests/budget.test.ts) (accept & reject cases) |
| **3 · Roles, permissions and privacy** | [Permission concept in docs/roles-and-privacy.md](docs/roles-and-privacy.md), role-specific views and data minimization |
| **4 · Architecture and engineering** | **Block A (Structure):** `app/` (routes), `app/domain/` (rules), `prisma/` (persistence)<br>**Block B (ADRs):** [docs/adr/](docs/adr/) (ADR 0001 Stack, ADR 0002 Identity, ADR 0003 Operation)<br>**Block C (Git history):** Commits and PRs distributed across sprint days |

## Team

* **Walad-m** ([@Walad-m](https://github.com/Walad-m))
* **Solomon Azinawo** ([@Azinawo](https://github.com/Azinawo))
* **Habib** ([@bawahmohammedhabib-dotcom](https://github.com/bawahmohammedhabib-dotcom))
* **Barkisu** ([@Iddrisu-Barkisu](https://github.com/Iddrisu-Barkisu))
* **Mujahid** ([@mujahidalhassan204-glitch](https://github.com/mujahidalhassan204-glitch))
