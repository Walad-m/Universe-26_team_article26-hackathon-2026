# Video Script & Pitch Guide · Team Orvix

**Total Video Duration:** Exactly 6:00 (3 parts: Business 2:30, Technical 2:30, Agile 1:00).  
**File Name:** `TEAMNAME_final.mp4`  
**Submission Email:** `education@article26.org` by Tuesday 11:00.

---

## Part 1 · Business Pitch (2:30) · Sabrina Dingfelder Rubric (10 Points)

*Speaker: Alhassan Mujahid (Product Owner)*  
*Rule: Answer the six questions in exact order. Numbers beat adjectives.*

### Question 1: What problem does our client have today, and what does it cost them?
> "Large German corporations purchase millions of Euros in external engineering services every year. But today, project managers track hours on fragmented spreadsheets while supplier invoices arrive 3 to 6 weeks late. For a typical enterprise running 25 concurrent external work orders, this blind spot results in an average budget overrun of **€140,000 per year** in unbudgeted work, plus **40 hours every month** wasted by managers manually reconciling discrepancies."

### Question 2: Who uses your product every day, who decides to buy it, and who pays for it? Where do their interests conflict?
> "Every day, **External Consultants** use Orvix to log deliverable work packages, while **Project Leads** use it to monitor burn rates and approve work logs. The **Head of IT Procurement / Purchasing** decides to buy it and pays for it out of the corporate IT steering budget.  
> Their interests conflict: Consultants want friction-free logging without intrusive monitoring; Project Leads want granular proof of work before approval; Purchasing wants macro budget burn-down and legal compliance without drowning in individual timesheets. Orvix resolves this through automated § 147 AO / DSGVO role separation."

### Question 3: The client uses spreadsheets and an old tool today. Why is switching worth it, including migration, rollout and training?
> "Switching takes less than **15 minutes per project**: Project Leads simply generate a unique portal link with the agreed order terms, requiring zero onboarding or ERP account setup for contractors. Retiring fragmented Excel sheets eliminates **80% of disputed invoice cycles** and prevents project standstills, paying back the rollout cost within the first 6 weeks of deployment."

### Question 4: What does your product save them, in hours, money or risk? Give a number.
> "Orvix delivers 3 concrete numbers:  
> 1. **Saves 32 manager hours per month** in manual timesheet reconciliation.  
> 2. **Saves €140,000 annually** in preventable budget overruns.  
> 3. **Eliminates 100% of co-employment (*Scheinselbstständigkeit*) compliance audit penalties** by focusing strictly on deliverable work packages rather than attendance punch clocks."

### Question 5: Which side of the hour are you on: the client, the service provider, or in between? And what do you leave out on purpose?
> "We are anchored firmly on the **Client side (Project Lead & Purchasing)**, while giving the service provider a frictionless, zero-barrier submission interface.  
> We deliberately leave out **employee attendance clocks (punch-in/punch-out)** to avoid German labor leasing (*AÜG*) liabilities, and we leave out **financial invoice payouts**, letting existing enterprise ERP/SAP systems handle final bank transfers after our digital proof of work (*Leistungsnachweis*) is approved."

### Question 6: If the budget only pays for four weeks, what ships and what waits?
> "In a 4-week scope:  
> - **Ships immediately:** Order setup, frictionless contractor portal, server-side ArbZG 10h validation, and the 4-week Reorder Early Warning Radar.  
> - **Waits for phase 2:** Automated ERP SAP connector plugins, multi-currency conversion, and multi-tier contractor sub-delegation workflows."

---

## Part 2 · Technical Demo (2:30) · Daniel Stüwe Rubric (10 Points)

*Speaker / Demo: Muhaysin Muqtar, Azinawo Solomon, Bawah Habib, Mahabub Abdul Fatawu (Developers)*  
*Format: Live screen recording showing working code from start to finish.*

### 1. Zero-Friction Setup & Architecture (0:00 – 0:40)
- Show the terminal: `npm test` runs 43/43 green unit tests in under 1 second.
- Show clean modular structure: `app/domain/` (pure business rules), `app/` (Next.js 15 Server Actions & UI), `prisma/` (SQLite persistence that survives restarts).
- Toggle between **English (🇬🇧)** and **German (🇩🇪)** with the Apple-style pill switch to demonstrate native internationalization.

### 2. Live Core Flow from Start to Finish (0:40 – 1:30)
- Log in as **Project Lead** (`lead@client.de`).
- Navigate to active order `PO-4500012345` (140 Person-Days budget).
- Switch to contractor perspective via invite token (`/portal/contractor-portal-2026`).
- Demonstrate server-side rejection: Attempt to submit 12 hours $\rightarrow$ Instant rejection: *German ArbZG § 3 strictly limits work to 10 hours per day*.
- Submit a valid 8-hour deliverable ("Engine diagnostic analysis") with an image proof attached.

### 3. Real-Time Reorder Radar & Privacy Safeguards (1:30 – 2:30)
- Return to Project Lead cockpit: Order budget instantly decrements in real-time.
- Showcase the **4-Week Reorder Radar**: Displays the exact calendar week (`KW 51`) when budget will exhaust, factoring in German holiday freezes.
- Switch to **Purchasing** (`purchasing@client.de`): Point out commercial privacy (§ 147 AO / DSGVO) where individual consultant names and activity details are automatically redacted into aggregated totals ($\Sigma$).

---

## Part 3 · Agile Crisis Response (1:00) · Holger Christein Rubric (10 Points)

*Speaker: Iddrisu Barkisu (Scrum Master) or Alhassan Mujahid (Product Owner)*  
*Format: Spoken presentation over EXACTLY TWO SLIDES. Do not show code.*

### Slide 1: Immediate Containment & Stakeholder Alignment (0:00 – 0:30)
*(Display Slide 1 from `docs/scrum.md`)*
> "When our calculation error surfaced across 100 enterprise clients mid-sprint with Works Council shutdown threats, we acted decisively:  
> First, **stabilization without blackout**: We used feature flags to suppress the flawed calculation display while keeping time booking ingress live with a transparent recalculation notice.  
> Second, **stakeholder alignment**: Our Product Owner briefed the Works Council directly with an immutable audit log, securing their agreement to a 72-hour review window instead of an immediate shutdown. For the three clients awaiting weekend features, our PO negotiated a 48-hour delivery buffer, prioritizing data integrity over rushed releases.  
> Third, **Scrum discipline**: Rather than panicking, the Product Owner formally terminated the sprint goal and launched a dedicated 1-week Swarm Sprint."

### Slide 2: Defect Correction, Data Repair & Long-term Prevention (0:30 – 1:00)
*(Display Slide 2 from `docs/scrum.md`)*
> "In phase two, our development team executed a three-tier recovery:  
> First, **defect correction**: We isolated the root cause to fractional day-rate rounding across multi-timezone bookings and deployed a hotfix branch backed by 15 regression test vectors.  
> Second, **audited data repair**: We wrote an idempotent migration script that recalculated the past 14 days of entries from raw event logs, providing each client and works council with an audited side-by-side reconciliation ledger.  
> Third, **lasting improvement**: In our retrospective, we amended our Definition of Done to mandate dual-developer sign-off and automated financial property testing on all calculation engine PRs. We protected customer trust, maintained council compliance, and returned to our regular sprint cadence."

