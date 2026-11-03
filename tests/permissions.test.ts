import { describe, it, expect } from "vitest";
import {
  canCreatePurchaseOrder,
  canApproveRejectWork,
  canCreateReorderProposal,
  canAccessClientDashboard,
  canBookTime,
  canAccessContractorPortal,
  filterBookingsForContractor,
  sanitizeBookingsForRole,
} from "../app/domain/permissions";

describe("Server-Side Role Permissions & Privacy Engine", () => {
  describe("Rule 1: Purchase Order Creation & Configuration", () => {
    it("allows Project Lead to create purchase orders", () => {
      const result = canCreatePurchaseOrder("project_lead");
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("allows Purchasing to create purchase orders", () => {
      const result = canCreatePurchaseOrder("purchasing");
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("rejects Consultant with 403 Forbidden", () => {
      const result = canCreatePurchaseOrder("consultant");
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("403 Forbidden");
    });

    it("rejects unauthenticated/anonymous with 403 Forbidden", () => {
      const result = canCreatePurchaseOrder(null);
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("403 Forbidden");
    });
  });

  describe("Rule 2: Approving & Rejecting Proof of Work", () => {
    it("allows Project Lead to approve or reject bookings", () => {
      const result = canApproveRejectWork("project_lead");
      expect(result.allowed).toBe(true);
    });

    it("rejects Purchasing from approving work (commercial role only)", () => {
      const result = canApproveRejectWork("purchasing");
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("Purchasing oversees commercial governance only");
    });

    it("rejects Consultant from approving their own work", () => {
      const result = canApproveRejectWork("consultant");
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("403 Forbidden");
    });
  });

  describe("Rule 3: Reorder Proposal Creation", () => {
    it("allows Project Lead to trigger reorder proposal", () => {
      const result = canCreateReorderProposal("project_lead");
      expect(result.allowed).toBe(true);
    });

    it("allows Purchasing to create reorder proposal", () => {
      const result = canCreateReorderProposal("purchasing");
      expect(result.allowed).toBe(true);
    });

    it("rejects Consultant from triggering reorder proposal", () => {
      const result = canCreateReorderProposal("consultant");
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("403 Forbidden");
    });
  });

  describe("Rule 4: Client Dashboard Cockpit Access", () => {
    it("allows Project Lead to access dashboard", () => {
      const result = canAccessClientDashboard("project_lead");
      expect(result.allowed).toBe(true);
    });

    it("allows Purchasing to access dashboard", () => {
      const result = canAccessClientDashboard("purchasing");
      expect(result.allowed).toBe(true);
    });

    it("rejects Consultant from accessing client dashboard", () => {
      const result = canAccessClientDashboard("consultant");
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("External consultants must use their designated contractor portal");
    });
  });

  describe("Rule 5: Time Booking Rights", () => {
    it("allows Consultant to book working time", () => {
      const result = canBookTime("consultant");
      expect(result.allowed).toBe(true);
    });

    it("rejects Project Lead from booking working time", () => {
      const result = canBookTime("project_lead");
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("403 Forbidden");
    });

    it("rejects Purchasing from booking working time", () => {
      const result = canBookTime("purchasing");
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("403 Forbidden");
    });
  });

  describe("Rule 6: Privacy Separation & Data Minimization (§ 147 AO / DSGVO)", () => {
    const mockBookings = [
      {
        consultantName: "Alex Becker",
        description: "Implemented Kafka message queue consumer",
        hours: 8,
      },
    ];

    it("retains individual consultant name and work description for Project Lead", () => {
      const sanitized = sanitizeBookingsForRole(mockBookings, "project_lead");
      expect(sanitized[0].consultantName).toBe("Alex Becker");
      expect(sanitized[0].description).toBe("Implemented Kafka message queue consumer");
    });

    it("redacts consultant name and activity description for Purchasing", () => {
      const sanitized = sanitizeBookingsForRole(mockBookings, "purchasing");
      expect(sanitized[0].consultantName).toContain("Redacted");
      expect(sanitized[0].description).toContain("Aggregated commercial verification");
    });

    it("returns empty array for unknown or unauthorized roles", () => {
      const sanitized = sanitizeBookingsForRole(mockBookings, "other");
      expect(sanitized).toHaveLength(0);
    });
  });

  describe("Rule 7: Contractor Portal Access & Vendor Isolation", () => {
    it("rejects Client Project Lead from accessing contractor portal", () => {
      const result = canAccessContractorPortal("project_lead", "client-company-id", "supplier-alpha-id");
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("Client enterprise accounts");
    });

    it("rejects Client Purchasing from accessing contractor portal", () => {
      const result = canAccessContractorPortal("purchasing", "client-company-id", "supplier-alpha-id");
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("Client enterprise accounts");
    });

    it("rejects Consultant from different supplier company (cross-tenant leak prevention)", () => {
      const result = canAccessContractorPortal("consultant", "supplier-beta-id", "supplier-alpha-id");
      expect(result.allowed).toBe(false);
      expect(result.error).toContain("Vendor isolation active");
    });

    it("allows Consultant belonging to the assigned supplier company", () => {
      const result = canAccessContractorPortal("consultant", "supplier-alpha-id", "supplier-alpha-id");
      expect(result.allowed).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe("Rule 8: Contractor Peer Isolation (Own Bookings Only)", () => {
    const mixedBookings = [
      { id: "1", userId: "consultant-alex", hours: 8, description: "Alex deliverable" },
      { id: "2", userId: "consultant-sophie", hours: 6, description: "Sophie deliverable" },
      { id: "3", userId: "consultant-alex", hours: 4, description: "Alex deliverable 2" },
    ];

    it("filters deliverables so Alex only sees Alex's work", () => {
      const result = filterBookingsForContractor(mixedBookings, "consultant-alex");
      expect(result).toHaveLength(2);
      expect(result.every((b) => b.userId === "consultant-alex")).toBe(true);
      expect(result.some((b) => b.userId === "consultant-sophie")).toBe(false);
    });

    it("returns empty array when user is unauthenticated", () => {
      const result = filterBookingsForContractor(mixedBookings, null);
      expect(result).toHaveLength(0);
    });
  });
});
