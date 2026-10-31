# Product vision

## Product name

Orvix

## In one sentence

For **Project Leads and Purchasing at large enterprises**, who **suffer from blind-spot contractor budget overruns and late monthly invoices**, our product **Orvix** is an **intelligent order governance & burn-rate cockpit** that **provides real-time budget forecasting and automated 4-week reorder alerts**. Unlike spreadsheets and legacy ERP tools, it **lets the client configure project terms agreed in supplier alignment meetings and gives external consultants a frictionless, deliverable-based booking portal**.

## Who we build for first

**The Project Lead (Client side)** — the person accountable for project delivery and budget control, who needs to set up agreed order terms, assign external consultants, and steer real-time burn-down without waiting for delayed month-end invoices.

## Roles

| Role | Side (client / supplier) | What they want from the product |
|---|---|---|
| Project Lead | Client | Configure purchase orders, set agreed budgets & thresholds, assign consultants, monitor real-time burn forecasts, and approve monthly proofs of work (*Leistungsnachweise*). |
| Purchasing / Finance | Client | Maintain spend governance, see aggregated order drawdowns, and receive early reorder alerts 4 weeks before budget runs out to place follow-up orders in time. |
| External Consultant | Supplier | View assigned orders, log deliverable days/hours in seconds without complex forms, and track approval status without privacy intrusion. |

## The core flow

1. **Order Setup & Configurable Terms:** The Project Lead creates a Purchase Order (e.g. 140 Person-Days) with parameters agreed in the supplier alignment meeting (e.g., 8h = 1 PD, max 10h/day limit, 4-week reorder alert buffer).
2. **Consultant Assignment:** The Project Lead assigns external service providers and their consultants to the order.
3. **Frictionless Booking:** The external consultant logs in, selects their assigned order, and records deliverable hours or person-days with a short description of the work package.
4. **Server-Side Rule Enforcement:** The system validates the entry against the remaining free budget and German Working Time Act (*ArbZG*) compliance rules.
5. **Real-time Forecast & Reorder Alert:** The Project Lead's dashboard immediately updates the remaining budget and recalibrates the forecast date (factoring in German public holidays and holiday freezes), alerting Purchasing if a reorder must be initiated.

## What makes us special

- **Configurable Supplier Alignment:** Project parameters (reorder lead times, daily hour limits, day-rate conversion) are fully configurable per order, reflecting the specific agreement reached during the client-supplier kickoff meeting.
- **The 4-Week Reorder Radar:** Predicts the exact calendar week (*Kalenderwoche*) the budget will run out (accounting for German state holidays and year-end shutdown) and triggers a reorder warning 4 weeks in advance so purchasing can place follow-up orders before project work stalls.
- **Compliance by Design:** Focuses on deliverables and work packages to prevent *Scheinselbstständigkeit* (bogus self-employment) risks under German labor law.

## What we leave out on purpose

- **Minute-by-minute punch clocks:** No employee-style attendance timers or micromanagement (prevents co-employment / labor leasing legal risks).
- **Invoice payouts:** Orvix verifies and approves the proof of work (*Leistungsnachweis*); formal invoice billing and payment remain in the client's enterprise ERP/accounting system.

## Our track

**Working code** (aiming for the full 10 technical points).

## Our stack

**Next.js 15 + TypeScript + Prisma (SQLite) + Tailwind CSS + Vitest**. See [ADR 0001: Technology Stack](adr/0001-stack-nextjs-prisma-sqlite.md).
