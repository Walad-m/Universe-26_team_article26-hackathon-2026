import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Orvix database...");

  // 1. Clean existing records
  await prisma.booking.deleteMany();
  await prisma.orderAssignment.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // 2. Create Companies
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

  const supplierBeta = await prisma.company.create({
    data: {
      name: "Consulting Beta GmbH",
      type: "supplier",
    },
  });

  // 3. Create Demo Users (Password: password)
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

  const consultantA = await prisma.user.create({
    data: {
      name: "Alex Becker (Consultant Alpha)",
      email: "consultant@supplier-a.de",
      password: "password",
      role: "consultant",
      companyId: supplierAlpha.id,
    },
  });

  const consultantB = await prisma.user.create({
    data: {
      name: "Sophie Wagner (Consultant Beta)",
      email: "consultant@supplier-b.de",
      password: "password",
      role: "consultant",
      companyId: supplierBeta.id,
    },
  });

  // 4. Create Purchase Order (Customer Portal Migration)
  // Matching the challenge example: 140 Person-Days total budget
  const order = await prisma.purchaseOrder.create({
    data: {
      orderNumber: "PO-4500012345",
      title: "Customer Portal Migration",
      description: "Migration of legacy customer database and frontend reconciliation",
      totalBudgetDays: 140.0,
      dailyHoursPerDay: 8.0,
      maxDailyHours: 10.0,
      reorderLeadWeeks: 4,
      federalState: "BY",
      startDate: new Date("2026-07-01"),
      endDate: new Date("2027-02-15"),
      status: "active",
      companyId: supplierAlpha.id,
    },
  });

  // 5. Assign Consultant Alpha to Order
  await prisma.orderAssignment.create({
    data: {
      purchaseOrderId: order.id,
      userId: consultantA.id,
    },
  });

  // 6. Seed Sample Bookings (84 Person-Days consumed across past weeks)
  // Let's create representative approved bookings
  const sampleBookings = [
    { date: new Date("2026-10-12"), hours: 8.0, description: "Architecture refactoring of auth module" },
    { date: new Date("2026-10-13"), hours: 8.0, description: "Database schema migration scripts" },
    { date: new Date("2026-10-14"), hours: 8.0, description: "API gateway integration" },
    { date: new Date("2026-10-15"), hours: 8.0, description: "Performance benchmarking" },
    { date: new Date("2026-10-16"), hours: 8.0, description: "Code review and security audit" },
    { date: new Date("2026-10-19"), hours: 8.0, description: "Legacy CRM data export verification" },
    { date: new Date("2026-10-20"), hours: 8.0, description: "REST endpoint unit testing" },
    { date: new Date("2026-10-21"), hours: 8.0, description: "Frontend dashboard components" },
  ];

  for (const b of sampleBookings) {
    await prisma.booking.create({
      data: {
        purchaseOrderId: order.id,
        userId: consultantA.id,
        date: b.date,
        hours: b.hours,
        description: b.description,
        status: "approved",
      },
    });
  }

  console.log("Seeding finished successfully!");
  console.log("Demo Users created:");
  console.log(" - Project Lead: lead@client.de / password");
  console.log(" - Purchasing: purchasing@client.de / password");
  console.log(" - Consultant A: consultant@supplier-a.de / password");
  console.log(" - Consultant B: consultant@supplier-b.de / password");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

