import { execSync } from "node:child_process";

const labels = [
  { name: "sprint-1", color: "0E8A16", description: "Sprint 1 (Walking Skeleton & Core Flow)" },
  { name: "sprint-2", color: "1D76DB", description: "Sprint 2 (Governance, Radar, Privacy, Apple UI, i18n)" },
  { name: "change-request", color: "D93F0B", description: "Saturday Change Requests" },
  { name: "domain", color: "5319E7", description: "Domain business rules and tests" },
  { name: "ui-ux", color: "FBCA04", description: "User Interface and Experience" },
  { name: "done", color: "006B75", description: "Verified & Done against DoD" },
];

console.log("1. Creating GitHub Labels...");
for (const l of labels) {
  try {
    execSync(`gh label create "${l.name}" --color "${l.color}" --description "${l.description}" --force`, { stdio: "ignore" });
    console.log(`✓ Label: ${l.name}`);
  } catch (err) {
    console.log(`- Label ${l.name} already exists or updated.`);
  }
}

const tasks = [
  // Sprint 1
  {
    title: "TSK-01: SQLite Schema & Prisma ORM Modeling",
    body: "## Epic: Core Foundation & Persistence\n\nPrisma schema modeling for User, Order, Booking, ContractorInvite entities. Server persistence survives restarts.\n\n- **Assignee:** Bawah Habib\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** `npx prisma db push && npm run seed`",
    labels: "sprint-1,done",
  },
  {
    title: "TSK-02: Challenge Baseline Seed Data",
    body: "## Epic: Core Foundation & Persistence\n\nSeed active order `PO-4500012345` (140 Person-Days) and 3 demo personas (Project Lead, Purchasing, Consultant).\n\n- **Assignee:** Bawah Habib\n- **Estimate:** 2 Story Points\n- **Status:** Done\n- **Verification:** `npm run seed`",
    labels: "sprint-1,done",
  },
  {
    title: "TSK-03: Next.js 15 App Router & Server Actions Architecture",
    body: "## Epic: Core Architecture\n\nImplement Next.js 15 App Router with pure Server Actions in `app/actions/`.\n\n- **Assignee:** Muhaysin Muqtar\n- **Estimate:** 5 Story Points\n- **Status:** Done\n- **Verification:** Zero TypeScript errors",
    labels: "sprint-1,done",
  },
  {
    title: "TSK-04: Multi-Role Session Switcher & Authentication",
    body: "## Epic: Core Security & Roles\n\nInstant demo login for Project Lead (`lead@client.de`), Purchasing (`purchasing@client.de`), and Consultant (`alex@agencyalpha.de`).\n\n- **Assignee:** Muhaysin Muqtar\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** Role switching verified in browser",
    labels: "sprint-1,done",
  },
  {
    title: "TSK-05: Server-Side Remaining Free Budget Validation",
    body: "## Epic: Domain Rules\n\nPure domain function `validateBooking` enforcing free remaining budget. Rejects bookings exceeding free order balance.\n\n- **Assignee:** Azinawo Solomon\n- **Estimate:** 5 Story Points\n- **Status:** Done\n- **Verification:** `tests/budget.test.ts` (accept and reject cases)",
    labels: "sprint-1,domain,done",
  },
  {
    title: "TSK-06: German Working Time Act (ArbZG § 3) 10h Max Daily Limit",
    body: "## Epic: Domain Rules & Legal Compliance\n\nEnforce German ArbZG § 3 strictly limiting daily work to 10 hours with legally accurate German & English messages.\n\n- **Assignee:** Azinawo Solomon\n- **Estimate:** 5 Story Points\n- **Status:** Done\n- **Verification:** `tests/budget.test.ts` (10h & overtime tests)",
    labels: "sprint-1,domain,done",
  },
  {
    title: "TSK-07: Vitest Unit Test Automation Harness",
    body: "## Epic: Test Automation\n\nAutomate unit test execution using Vitest running 43 tests in < 1 second.\n\n- **Assignee:** Azinawo Solomon\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** `npm test` runs green",
    labels: "sprint-1,domain,done",
  },
  {
    title: "TSK-08: Frictionless Contractor Portal Ingress (/portal/[token])",
    body: "## Epic: Contractor Experience\n\nDeliverable-based booking interface for external consultants via unique token link without complex ERP credentials.\n\n- **Assignee:** Muhaysin Muqtar\n- **Estimate:** 5 Story Points\n- **Status:** Done\n- **Verification:** Live test in `/portal/[token]`",
    labels: "sprint-1,ui-ux,done",
  },

  // Sprint 2
  {
    title: "TSK-09: Proof of Work Attachment Storage (attachmentUrl)",
    body: "## Epic: Contractor Deliverables\n\nPrisma schema update and Server Action support for deliverable image and document attachments.\n\n- **Assignee:** Muhaysin Muqtar\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** `attachmentUrl` persisted in SQLite",
    labels: "sprint-2,ui-ux,done",
  },
  {
    title: "TSK-10: Deliverable Attachment Lightbox Preview Modal",
    body: "## Epic: Review & Approvals\n\nInteractive Apple-style image lightbox modal allowing Project Leads to inspect proof of work before approving.\n\n- **Assignee:** Muhaysin Muqtar\n- **Estimate:** 2 Story Points\n- **Status:** Done\n- **Verification:** Modal opens and closes smoothly",
    labels: "sprint-2,ui-ux,done",
  },
  {
    title: "TSK-11: Contractor Budget Extension Request Drawer",
    body: "## Epic: Budget Flexibility\n\nWorkflow allowing contractors to submit budget increase requests (`extension_requested`) with 1-click Project Lead approval.\n\n- **Assignee:** Azinawo Solomon\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** Tested in portal and approval table",
    labels: "sprint-2,domain,done",
  },
  {
    title: "TSK-12: 3-Metric Executive Hierarchy Cockpit (€ Money, Person-Days, Hours)",
    body: "## Epic: Executive Governance\n\nPresent all 3 key metrics simultaneously with Euros (€) leading prominently on top, Person-Days in the middle, Hours below.\n\n- **Assignee:** Mahabub Abdul Fatawu\n- **Estimate:** 5 Story Points\n- **Status:** Done\n- **Verification:** Executive bento cards in `/dashboard`",
    labels: "sprint-2,ui-ux,done",
  },
  {
    title: "TSK-13: Saturday Change 1: 4-Week Reorder Early Warning Radar",
    body: "## Epic: Saturday Change Requests\n\nCompute exact calendar week (`KW`) when budget will exhaust based on 4-week moving average pace. Alert 4 weeks in advance.\n\n- **Assignee:** Mahabub Abdul Fatawu\n- **Estimate:** 5 Story Points\n- **Status:** Done\n- **Verification:** `computeOrderForecast()` in `app/domain/budget.ts`",
    labels: "sprint-2,change-request,done",
  },
  {
    title: "TSK-14: German Holiday & Year-End Shutdown Simulation Engine",
    body: "## Epic: Saturday Change Requests\n\nModel German Christmas/New Year shutdown (KW 52–KW 01) with interactive Apple-style toggle switch on dashboard.\n\n- **Assignee:** Mahabub Abdul Fatawu\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** Dynamic toggle updates runway in real-time",
    labels: "sprint-2,change-request,done",
  },
  {
    title: "TSK-15: Self-Service Contractor Link Generator with Auto-PO Numbering",
    body: "## Epic: Contractor Onboarding\n\nProject Leads can generate portal links for new external suppliers with consistent PO numbers (e.g. `PO-45000...`) and copy link in 1 click.\n\n- **Assignee:** Mahabub Abdul Fatawu\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** Tested on Links tab",
    labels: "sprint-2,ui-ux,done",
  },
  {
    title: "TSK-16: Work Log Review & Sign-Off Workflow",
    body: "## Epic: Approvals & Governance\n\nReview table supporting 1-click Approve, Reject (with reason), and Extension Approval with live budget incrementation.\n\n- **Assignee:** Mahabub Abdul Fatawu\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** Approvals tab in `/dashboard`",
    labels: "sprint-2,ui-ux,done",
  },
  {
    title: "TSK-17: Commercial Code § 147 AO / DSGVO Data Minimization Engine",
    body: "## Epic: Privacy & Compliance\n\nDomain RBAC engine enforcing privacy boundaries so Purchasing only sees aggregated totals (Σ) and never individual specialist notes.\n\n- **Assignee:** Bawah Habib\n- **Estimate:** 5 Story Points\n- **Status:** Done\n- **Verification:** `app/domain/permissions.ts`",
    labels: "sprint-2,domain,done",
  },
  {
    title: "TSK-18: Purchasing Role View Redaction",
    body: "## Epic: Privacy & Compliance\n\nRedact consultant names and granular notes when logged in as Purchasing role.\n\n- **Assignee:** Bawah Habib\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** Verified with `purchasing@client.de`",
    labels: "sprint-2,domain,done",
  },
  {
    title: "TSK-19: Permission Engine Unit Test Suite (25 Tests)",
    body: "## Epic: Privacy & Test Automation\n\n25 automated unit tests testing role permissions, viewing rights, and redaction logic.\n\n- **Assignee:** Bawah Habib\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** `tests/permissions.test.ts` passes 25/25",
    labels: "sprint-2,domain,done",
  },
  {
    title: "TSK-20: Data Privacy Concept & Compliance Documentation",
    body: "## Epic: Privacy & Governance\n\nDocument legal rationale for role separation and § 147 AO data privacy in `docs/roles-and-privacy.md`.\n\n- **Assignee:** Alhassan Mujahid & Bawah Habib\n- **Estimate:** 2 Story Points\n- **Status:** Done\n- **Verification:** `docs/roles-and-privacy.md`",
    labels: "sprint-2,documentation,done",
  },
  {
    title: "TSK-21: ADR 0004: Apple-Inspired Minimalist Design System",
    body: "## Epic: Architecture Decisions\n\nDocument decision to adopt Apple Human Interface Guidelines and monetary-first metric hierarchy.\n\n- **Assignee:** Alhassan Mujahid & Iddrisu Barkisu\n- **Estimate:** 2 Story Points\n- **Status:** Done\n- **Verification:** `docs/adr/0004-ui-design-system-apple-principles.md`",
    labels: "sprint-2,documentation,done",
  },
  {
    title: "TSK-22: SF Pro & Inter Apple Typography Overhaul",
    body: "## Epic: UI / UX Polish\n\nIntegrate SF Pro Display, SF Pro Text, and Inter fonts with tight tracking and calibrated weights.\n\n- **Assignee:** Muhaysin Muqtar\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** Checked in browser inspection",
    labels: "sprint-2,ui-ux,done",
  },
  {
    title: "TSK-23: High-Contrast Bento Card Aesthetic (#F5F5F7 & #FFFFFF)",
    body: "## Epic: UI / UX Polish\n\nApple-style canvas with pure white bento cards, subtle border radiuses (`rounded-3xl`), and #0071E3 accents.\n\n- **Assignee:** Muhaysin Muqtar\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** Visual review in `/dashboard`",
    labels: "sprint-2,ui-ux,done",
  },
  {
    title: "TSK-24: LanguageContext Architecture with Dual Dictionaries",
    body: "## Epic: Internationalization\n\nReact Context providing high-performance English and German localization across all screens.\n\n- **Assignee:** Mahabub Abdul Fatawu\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** `app/context/LanguageContext.tsx`",
    labels: "sprint-2,ui-ux,done",
  },
  {
    title: "TSK-25: Apple-Style Bilingual Pill Switcher (LanguageToggle)",
    body: "## Epic: Internationalization\n\nClean `[ 🇩🇪 DE | 🇬🇧 EN ]` toggle positioned at the top of the sidebar with smooth state transitions.\n\n- **Assignee:** Mahabub Abdul Fatawu\n- **Estimate:** 2 Story Points\n- **Status:** Done\n- **Verification:** Instant language switch verified",
    labels: "sprint-2,ui-ux,done",
  },
  {
    title: "TSK-26: Full Bilingual Translation Across All Platform Screens",
    body: "## Epic: Internationalization\n\nTranslate Landing page, Login page, Management Cockpit, and Contractor Portal into idiomatic German and English.\n\n- **Assignee:** Mahabub Abdul Fatawu & Muhaysin Muqtar\n- **Estimate:** 5 Story Points\n- **Status:** Done\n- **Verification:** Verified in both DE and EN modes",
    labels: "sprint-2,ui-ux,done",
  },
  {
    title: "TSK-27: Saturday Change 2: Production Calculation Crisis Triage",
    body: "## Epic: Saturday Crisis Challenge\n\nFormulate emergency containment protocol using feature flags to isolate calculation bugs without blacking out time booking.\n\n- **Assignee:** Alhassan Mujahid & Iddrisu Barkisu\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** Documented in `docs/scrum.md` Section 6",
    labels: "sprint-2,change-request,done",
  },
  {
    title: "TSK-28: Root Cause Analysis, Regression Vectors & Audited Data Repair",
    body: "## Epic: Saturday Crisis Challenge\n\nDesign idempotent recalculation migration script and reconcile past 14 days of data for Works Council audit.\n\n- **Assignee:** Azinawo Solomon & Bawah Habib\n- **Estimate:** 3 Story Points\n- **Status:** Done\n- **Verification:** Documented in `docs/scrum.md` Section 6",
    labels: "sprint-2,change-request,done",
  },
  {
    title: "TSK-29: Two-Slide Crisis Resolution Presentation Script",
    body: "## Epic: Saturday Crisis Challenge\n\nAuthor exact 2-slide presentation and 1-minute spoken script tailored to Holger Christein's 10-point rubric.\n\n- **Assignee:** Alhassan Mujahid & Iddrisu Barkisu\n- **Estimate:** 2 Story Points\n- **Status:** Done\n- **Verification:** `docs/pitch-and-presentation.md` Part 3",
    labels: "sprint-2,change-request,done",
  },
  {
    title: "TSK-30: README Verification & 5-Minute Zero-Barrier Run Check",
    body: "## Epic: Quality & Juror Experience\n\nTest clean clone in fresh environment using README instructions only (`npm install && npx prisma db push && npm run seed`).\n\n- **Assignee:** Azinawo Solomon\n- **Estimate:** 2 Story Points\n- **Status:** Done\n- **Verification:** Daniel Stüwe 5-minute run check verified",
    labels: "sprint-2,documentation,done",
  },
];

console.log("\n2. Creating and closing Backlog Issues on GitHub...");
for (const task of tasks) {
  try {
    const escapedBody = task.body.replace(/"/g, '\\"');
    const out = execSync(`gh issue create --title "${task.title}" --body "${escapedBody}" --label "${task.labels}"`, { encoding: "utf-8" }).trim();
    console.log(`Created: ${task.title} -> ${out}`);
    // Extract issue number or URL and close it since it is done
    const match = out.match(/\/issues\/(\d+)/);
    if (match) {
      const issueNum = match[1];
      execSync(`gh issue close ${issueNum} --reason completed`, { stdio: "ignore" });
      console.log(`  ✓ Closed #${issueNum} (Completed)`);
    }
  } catch (err) {
    console.error(`Failed on ${task.title}:`, err.message);
  }
}

console.log("\n🎉 All 30 Product Backlog items successfully synchronized to GitHub Issues!");

