# 0002 · Identity, Authentication, and Seeded Role-Based Access

- **Status:** accepted
- **Date:** 2026-10-31
- **Deciders:** Orvix Hackathon Team

## Context

**Orvix** is built as the dedicated internal platform for a large German client company. It must accommodate multiple internal roles (*Project Leads*, *Purchasing / Finance*) as well as external contributors (*External Consultants* from various vendor organizations). 

Key constraints:
- **Hackathon evaluation:** Jurors must be able to test each distinct role immediately from a fresh clone without configuring external OAuth apps, third-party API keys, or email verification servers (Criterion 5).
- **Role integrity:** Roles must be strictly separated and enforced on the server (Criterion 3), preventing external consultants from seeing other vendors or internal financial overviews.
- **Enterprise production requirements:** In production, enterprise employees authenticate via central corporate identity providers (Microsoft Entra ID, Keycloak, or SAML 2.0).

## Options considered

1. **Option A: Next.js Session-Cookie Authentication with Pre-Seeded Demo Roles (Chosen)**
   - *Pros:* Zero setup friction for jurors; authentic login experience with pre-seeded credentials; fast development velocity; clean role-based protection in Next.js Server Actions and Middleware.
   - *Cons:* Switching accounts requires logging out and logging in as the target demo user.

2. **Option B: OAuth2 / Social Login Only (Google/GitHub)**
   - *Pros:* Convenient for consumer apps.
   - *Cons:* Requires jurors to have internet access and team API keys configured in `.env`; violates enterprise German corporate governance where external consumer logins are not permitted.

3. **Option C: Dedicated Keycloak / SSO Container in Demo**
   - *Pros:* Realistic enterprise simulation.
   - *Cons:* Adds high memory overhead, slow boot times, and configuration complexity in Docker, risking failure during the 5-minute juror run check.

## Decision

We choose **Option A: Next.js session authentication with pre-seeded demo accounts**.

- We implement real role attributes and authorizations verified in Server Actions and Route Handlers.
- The seed script (`npm run seed`) creates verified demo users for each core role:
  - **Project Lead (Client):** `lead@client.de`
  - **Purchasing (Client):** `purchasing@client.de`
  - **External Consultant (Supplier A):** `consultant@supplier-a.de`
  - **External Consultant (Supplier B):** `consultant@supplier-b.de`
- **Production Roadmap:** In enterprise production, internal client staff authenticate via OpenID Connect (OIDC) / SAML 2.0 against the company's identity provider (e.g. Microsoft Entra ID), while external consultants are onboarded via secure vendor invitation links.

## Consequences

- **What becomes easier:** Instant startup for jurors; reliable, reproducible testing of permissions; clean separation of roles on the server.
- **What becomes harder:** In local testing, switching roles requires logging out and logging in as the target demo user.

