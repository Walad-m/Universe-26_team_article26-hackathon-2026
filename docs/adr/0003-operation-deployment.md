# 0003 · Dedicated Enterprise Deployment and Multi-Vendor Operation

- **Status:** accepted
- **Date:** 2026-10-31
- **Deciders:** Orvix Hackathon Team

## Context

The German client company purchases external project work from multiple distinct vendor agencies and consulting firms. 

Key constraints and requirements:
- **Data residency and privacy (GDPR / DSGVO):** Enterprise project costs, purchase orders, and consultant work logs must remain strictly within German/EU data boundaries. US-hosted multi-tenant clouds present compliance hurdles (e.g. US CLOUD Act).
- **Multi-project & multi-vendor isolation:** The platform must allow the German company to manage dozens of concurrent internal projects while preventing external vendors from seeing competitor projects, day rates, or bookings.
- **Hackathon evaluation & production scaling:** The system must run smoothly and reliably on any juror's laptop with zero cloud services or Docker dependencies, while presenting a credible enterprise scaling architecture for production.

## Options considered

1. **Option A: Dedicated Single-Enterprise Deployment with Multi-Vendor Scoping (Chosen)**
   * *Architecture:* Packaged as a dedicated enterprise instance deployed inside the German client's private cloud or German data center (e.g. STACKIT, Open Telekom Cloud, or ISO 27001-certified EU region).
   * *Data Isolation:* Multi-project and multi-vendor logic is enforced at the database query level (`supplierId` scoping) and checked in Server Actions.
   * *Database:* SQLite for local hackathon runs (zero configuration, reliable persistence in a local file); PostgreSQL with connection pooling (PgBouncer) and Redis caching for production.
   * *Pros:* Fully satisfies German compliance, enterprise security, and works councils (*Betriebsrat*); zero vendor cross-contamination; runs effortlessly on any laptop in < 60 seconds.
   * *Cons:* Dedicated instances require operational management compared to public shared SaaS.

2. **Option B: Public Shared Multi-Tenant SaaS**
   * *Pros:* Lower hosting cost per customer.
   * *Cons:* Unacceptable to large German enterprises handling sensitive SAP project accounting data and proprietary contractor rates; higher risk of data leakage between rival companies.

## Decision

We choose **Option A: Dedicated Single-Enterprise Platform with Multi-Vendor Isolation**.

- The platform is deployed exclusively for the German client company.
- The company's Project Leads can manage unlimited projects and assign different external vendor organizations.
- External consultants have access restricted strictly to their employer's assigned purchase orders.
- For the hackathon, SQLite provides lightweight, restart-proof persistence. In production, the system scales with PostgreSQL, Redis queues, and Docker/Kubernetes container orchestration.

## Consequences

- **What becomes easier:** Absolute data sovereignty and compliance with German privacy standards; simple, guaranteed local execution for judges.
- **What becomes harder:** We must ensure database queries and Server Actions strictly check supplier ownership so that consultants never access unauthorized projects.

