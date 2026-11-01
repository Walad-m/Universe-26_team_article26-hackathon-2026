# 0004 · Apple-Inspired Minimalist Design System & Hierarchy Principles

- **Status:** accepted
- **Date:** 2026-11-01
- **Deciders:** Muhaysin Muqtar, Solomon Azinawo, Barkisu, Mujahid Bello, Habib Abdullahi

## Context

During user testing of Sprint 3 (Forecasting and Contractor Portal), the dashboard had accumulated multiple clashing accent colors (emerald green, sky blue, amber, dark slate) and placed Person-Days prominently above monetary values. 

In corporate procurement and executive leadership, Project Leads track contracts primarily by monetary budget (€ spent and € remaining), while contractors deliver in days and hours. Furthermore, visual clutter and conflicting color codes reduced clarity and professionalism for enterprise stakeholders and the hackathon jury.

We needed a unified, non-vague design principle based on proven enterprise consumer standards (Apple.com design language) that enforces clarity, focus, and visual calm.

## Options considered

1. **Option A: Traditional Enterprise BI Dashboard (Dense grids, multi-color traffic lights)**
   - *Pros:* Familiar in legacy SAP/Oracle environments; packs many dense numbers together.
   - *Cons:* Visually cluttered ("clumsy"), high cognitive load, confusing for non-technical stakeholders and external contractors.

2. **Option B: Generic SaaS Template (Tailwind UI Indigo/Violet with default cards)**
   - *Pros:* Fast to assemble out of the box.
   - *Cons:* Generic appearance; doesn't reflect the high-stakes precision of multi-million Euro German enterprise projects.

3. **Option C: Apple-Inspired Minimalist Design System (Monochrome base with intentional #0071E3 Blue touch)**
   - *Pros:* Clean `#F5F5F7` light gray canvas with pure white `#FFFFFF` bento cards; crisp `#1D1D1F` typography; zero extraneous green clutter; dual-pill button architecture (`#0071E3` solid pill + outline pill); strict monetary-first metric hierarchy.
   - *Cons:* Requires discipline in not reintroducing arbitrary accent colors for everyday states.

## Decision

We chose **Option C: Apple-Inspired Minimalist Design System** with the following concrete, non-negotiable principles:

1. **Single Interactive Accent (#0071E3 Apple Blue):**
   - The canvas is neutral monochrome (`#F5F5F7` background, pure white `#FFFFFF` cards, `#1D1D1F` headlines, `#86868B` metadata).
   - Apple Blue (`#0071E3`) is strictly reserved for primary user actions (CTAs), active focus tabs, and interactive navigation links. Green is eliminated from status badges, replacing it with subtle neutral monochrome badges (`bg-black/[0.04] text-[#1D1D1F]`).
2. **Dual-Pill Action Architecture:**
   - Primary Action: Solid Apple Blue pill (`bg-[#0071E3] text-white rounded-full font-semibold shadow-xs hover:bg-[#0077ED]`).
   - Secondary Action: Ghost outline pill (`border border-[#0071E3] text-[#0071E3] rounded-full hover:bg-[#0071E3]/5`).
   - Neutral Filter: Subtle gray pill (`bg-black/[0.04] text-[#1D1D1F] rounded-full`).
3. **Bento Card Geometry:**
   - 24px curvature (`rounded-3xl`) for primary modules, 16px (`rounded-2xl`) for metric tiles, with delicate hairline borders (`border-black/[0.06]`) and subtle elevation (`shadow-[0_2px_12px_rgba(0,0,0,0.02)]`).
4. **Monetary-First Hierarchy:**
   - Monetary values (€) are always positioned on top as the primary headline (`text-3xl font-extrabold font-mono tabular-nums text-[#1D1D1F]`).
   - Operational units (Person-Days and Hours) sit directly beneath as contextual support (`text-xs text-[#86868B]`).
5. **Ample Breathing Room & Plain Language:**
   - Generous negative space between sections with plain English and German enterprise terms without vague jargon.

## Consequences

- **What becomes easier:** The user experience is calm, legible, and immediately conveys high executive polish to the jury. Both Project Leads and contractors understand their metrics at a single glance.
- **What becomes harder:** Developers must adhere to the design system and avoid adding one-off colors for status indicators. Amber is preserved strictly for urgent reorder alerts (shortages).
- **Next steps:** Apply the pill button patterns and bento cards consistently across Landing Page, Dashboard, and Contractor Portal.
