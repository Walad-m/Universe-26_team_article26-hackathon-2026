# 0001 · Technology Stack: Next.js 15, TypeScript, Prisma (SQLite), Tailwind CSS, and Vitest

- **Status:** accepted
- **Date:** 2026-10-31
- **Deciders:** Orvix Hackathon Team

## Context

We are building **Orvix**, an enterprise time-booking and budget burn-rate cockpit for a large German client purchasing project work from external service providers, in a 4-day hackathon.

Key forces and constraints:
- **Strict 5-minute juror run-check (Criterion 5):** The technical juror must be able to clone the repository and start the full application with sample data in under 5 minutes without failing due to complex multi-language toolchains.
- **Agile team collaboration (4 developers):** Four developers must work in parallel on separate feature branches without database migration merge bottlenecks.
- **Persistence surviving restart (Criterion 1):** The database must survive restarts locally with zero cloud or Docker dependencies.
- **Fast unit testing (Criterion 2):** Domain business rules must be verified with instant unit tests for accepting and rejecting cases.

## Options considered

1. **Option A: Next.js 15 (App Router) + TypeScript + Prisma (SQLite) + Tailwind CSS + Vitest (Chosen)**
   * *Pros:* Single runtime (Node.js only); juror setup takes under 60 seconds (`npm install && npx prisma db push && npm run seed && npm run dev`); Prisma provides instant schema synchronization without migration conflicts (`prisma db push`) and a visual database GUI (`npx prisma studio`); Vitest executes unit tests in milliseconds; React Server Actions eliminate REST boilerplate while keeping business rules server-side.
   * *Cons:* Requires discipline to structure business logic cleanly in separate domain modules (`app/domain/`) rather than inline inside React components.

2. **Option B: Laravel 11 + React + SQLite**
   * *Pros:* Rich built-in scaffolding.
   * *Cons:* Requires two separate runtimes (PHP 8.2+ with Composer AND Node.js with NPM). During testing, downloading both package ecosystems on Windows exceeded 15 minutes, which poses an unacceptable risk to the juror's 5-minute setup limit.

3. **Option C: Next.js + PostgreSQL (Reference Blueprint)**
   * *Pros:* Enterprise relational database.
   * *Cons:* Requires the juror to have a running PostgreSQL server or Docker daemon, increasing the probability of environment setup failures.

## Decision

We choose **Option A: Next.js 15 with TypeScript, Prisma (SQLite), Tailwind CSS, and Vitest**.

This stack provides maximum velocity for our 4-developer Agile team, ensures instantaneous setup for the jury evaluation, and gives us complete type-safety from database to UI.

## Consequences

- **What becomes easier:** Rapid feature development; juror runs the app in < 60 seconds; visual database inspection via Prisma Studio; instant Vitest unit test execution.
- **What becomes harder:** We must maintain clean separation of concerns by placing domain calculations and rules in `app/domain/` to fulfill Criterion 4 (Structure).

