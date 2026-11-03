import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Resetting and seeding Orvix realistic challenge baseline (Clean Slate)...");

  // 1. Clean existing records completely
  await prisma.booking.deleteMany();
  await prisma.orderAssignment.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // 2. Create Companies (Client Enterprise & External Supplier Agency)
  const clientCompany = await prisma.company.create({
    data: {
      name: "Deutsche Enterprise AG",
      type: "client",
    },
  });

  const supplierAlpha = await prisma.company.create({
    data: {
      name: "Agency Alpha GmbH",
      type: "supplier",
    },
  });

  // 3. Create Demo Users (All with standard password: "password")
  const leadUser = await prisma.user.create({
    data: {
      name: "Klaus Schmidt (Project Lead)",
      email: "lead@client.de",
      password: "password",
      role: "project_lead",
      companyId: clientCompany.id,
    },
  });

  const purchasingUser = await prisma.user.create({
    data: {
      name: "Martina Weber (Purchasing)",
      email: "purchasing@client.de",
      password: "password",
      role: "purchasing",
      companyId: clientCompany.id,
    },
  });

  const consultantAlex = await prisma.user.create({
    data: {
      name: "Alex Becker (Consultant Alpha)",
      email: "alex@agencyalpha.de",
      password: "password",
      role: "consultant",
      companyId: supplierAlpha.id,
    },
  });

  // 4. Create Baseline Purchase Order from docs/challenge.md
  // 140 Person-Days total budget @ €100/h = €112,000 total order value
  const order = await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PO-4500012345",
      portalToken: "contractor-portal-2026",
      title: "Core Banking API Gateway Integration",
      description: "Integration of modern REST microservices with the core banking transaction ledger",
      totalBudgetDays: 140.0,
      hourlyRate: 100.0,
      dailyHoursPerDay: 8.0,
      maxDailyHours: 10.0,
      reorderLeadWeeks: 4,
      federalState: "BY",
      startDate: new Date("2026-10-01"),
      endDate: new Date("2027-02-15"),
      status: "active",
      companyId: supplierAlpha.id,
    },
  });

  // 5. Assign Consultant to Order
  await prisma.orderAssignment.create({
    data: {
      purchaseOrderId: order.id,
      userId: consultantAlex.id,
    },
  });

  // 6. Clean Slate: 0 bookings seeded so user and team can log and approve work live from scratch!

  console.log("Clean slate database reset completed successfully!");
  console.log("--------------------------------------------------");
  console.log("Demo Credentials (Password: password):");
  console.log(" • Project Lead: lead@client.de (Client Governance & Approvals)");
  console.log(" • Purchasing:   purchasing@client.de (Commercial Macro Governance)");
  console.log(" • Consultant:   alex@agencyalpha.de (Agency Alpha Specialist)");
  console.log("Active Contract: PO-4500012345 (140 Days / €112,000 / 0h logged)");
  console.log("Contractor Link: /portal/contractor-portal-2026");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
