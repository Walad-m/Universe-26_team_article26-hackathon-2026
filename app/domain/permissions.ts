/**
 * Domain Authorization & Role-Based Access Control (RBAC) Engine
 * Strictly enforces rules from docs/roles-and-privacy.md
 */

export type UserRole = "project_lead" | "purchasing" | "consultant";

export interface PermissionCheckResult {
  allowed: boolean;
  error?: string;
}

/**
 * Rule: Create & configure Purchase Order
 * Allowed: Project Lead (✔), Purchasing (✔)
 * Reject: External Consultant (–)
 */
export function canCreatePurchaseOrder(role?: string | null): PermissionCheckResult {
  if (role === "project_lead" || role === "purchasing") {
    return { allowed: true };
  }
  return {
    allowed: false,
    error: "403 Forbidden: Only Project Leads and Purchasing can create or configure purchase orders.",
  };
}

/**
 * Rule: Approve / reject proof of work (bookings)
 * Allowed: Project Lead (✔)
 * Reject: Purchasing (–), External Consultant (–)
 */
export function canApproveRejectWork(role?: string | null): PermissionCheckResult {
  if (role === "project_lead") {
    return { allowed: true };
  }
  if (role === "purchasing") {
    return {
      allowed: false,
      error: "403 Forbidden: Purchasing oversees commercial governance only and cannot approve technical proofs of work.",
    };
  }
  return {
    allowed: false,
    error: "403 Forbidden: Only the Client Project Lead can approve or reject work deliverables.",
  };
}

/**
 * Rule: Create follow-up reorder proposal / requisition
 * Allowed: Project Lead (✔), Purchasing (✔)
 * Reject: External Consultant (–)
 */
export function canCreateReorderProposal(role?: string | null): PermissionCheckResult {
  if (role === "project_lead" || role === "purchasing") {
    return { allowed: true };
  }
  return {
    allowed: false,
    error: "403 Forbidden: Only Project Leads and Purchasing can create reorder proposals.",
  };
}

/**
 * Rule: Access Client Management Cockpit (/dashboard)
 * Allowed: Project Lead (✔), Purchasing (✔)
 * Reject: External Consultant (–, must use partner portal)
 */
export function canAccessClientDashboard(role?: string | null): PermissionCheckResult {
  if (role === "project_lead" || role === "purchasing") {
    return { allowed: true };
  }
  return {
    allowed: false,
    error: "403 Forbidden: External consultants must use their designated contractor portal.",
  };
}

/**
 * Rule: Access External Contractor Portal (/portal/[token])
 * Allowed: External Consultant belonging to the assigned supplier company (✔)
 * Reject: Client Project Lead (–), Client Purchasing (–), or Wrong Supplier Company (–)
 */
export function canAccessContractorPortal(
  role?: string | null,
  userCompanyId?: string | null,
  orderCompanyId?: string | null
): PermissionCheckResult {
  if (role !== "consultant") {
    return {
      allowed: false,
      error: "403 Forbidden: Client enterprise accounts (Project Lead & Purchasing) cannot access external contractor portals. Please use the management cockpit at /dashboard.",
    };
  }

  if (orderCompanyId && userCompanyId && userCompanyId !== orderCompanyId) {
    return {
      allowed: false,
      error: "403 Forbidden: Vendor isolation active. Your account is registered under another supplier organization and cannot access this project.",
    };
  }

  return { allowed: true };
}

/**
 * Rule: Book working time on assigned purchase order
 * Allowed: External Consultant (✔)
 * Reject: Client Project Lead (–), Purchasing (–)
 */
export function canBookTime(role?: string | null): PermissionCheckResult {
  if (role === "consultant") {
    return { allowed: true };
  }
  return {
    allowed: false,
    error: "403 Forbidden: Only assigned external consultants can book working time against a purchase order.",
  };
}

/**
 * Privacy Rule: Data Minimization & Privacy Separation (docs/roles-and-privacy.md)
 * - Project Lead sees line-by-line deliverables and specialist names.
 * - Purchasing sees only aggregated values (Σ); individual names & descriptions are redacted.
 */
export function sanitizeBookingsForRole<T extends { consultantName: string; description: string }>(
  bookings: T[],
  role?: string | null
): T[] {
  if (role === "project_lead") {
    return bookings;
  }
  if (role === "purchasing") {
    return bookings.map((b) => ({
      ...b,
      consultantName: "External Specialist (Redacted for Privacy)",
      description: "Deliverable item (Aggregated commercial verification only)",
    }));
  }
  return [];
}

/**
 * Privacy Rule: Contractor Peer Isolation (docs/roles-and-privacy.md)
 * "View individual bookings & descriptions: External Consultant (✔ own bookings only)"
 * A contractor must ONLY see their own submitted deliverables.
 * Deliverables submitted by peer contractors on the same project are filtered out.
 */
export function filterBookingsForContractor<T extends { userId: string }>(
  bookings: T[],
  currentUserId?: string | null
): T[] {
  if (!currentUserId) return [];
  return bookings.filter((b) => b.userId === currentUserId);
}
