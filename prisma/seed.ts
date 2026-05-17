import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const DATABASE_URL = process.env.DATABASE_URL || 
  "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable&connection_limit=10&connect_timeout=0&max_idle_connection_lifetime=0&pool_timeout=0&socket_timeout=0";

const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter } as any);



async function main() {
  console.log("🌱 Seeding database...");

  // Clean up
  await prisma.auditLog.deleteMany();
  await prisma.checkin.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.cycle.deleteMany();
  await prisma.escalationRule.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("demo123", 10);

  // Create users
  const manager = await prisma.user.create({
    data: {
      email: "manager@demo.com",
      name: "Priya Sharma",
      password: hashedPassword,
      role: "MANAGER",
      department: "Engineering",
    },
  });

  const employee = await prisma.user.create({
    data: {
      email: "employee@demo.com",
      name: "Arjun Mehta",
      password: hashedPassword,
      role: "EMPLOYEE",
      department: "Engineering",
      managerId: manager.id,
    },
  });

  const admin = await prisma.user.create({
    data: {
      email: "admin@demo.com",
      name: "Kavita Reddy",
      password: hashedPassword,
      role: "ADMIN",
      department: "HR",
    },
  });

  // Create second employee for richer demo
  const employee2 = await prisma.user.create({
    data: {
      email: "employee2@demo.com",
      name: "Rahul Singh",
      password: hashedPassword,
      role: "EMPLOYEE",
      department: "Engineering",
      managerId: manager.id,
    },
  });

  console.log("✅ Users created");

  // Create active cycle (currently in Q1 window)
  const now = new Date();
  const cycle = await prisma.cycle.create({
    data: {
      name: "FY2025-26",
      goalSettingStart: new Date("2025-04-01"),
      goalSettingEnd: new Date("2025-04-30"),
      q1Start: new Date("2025-04-01"),
      q1End: new Date("2026-06-30"), // Extended to include now for demo
      q2Start: new Date("2026-07-01"),
      q2End: new Date("2026-09-30"),
      q3Start: new Date("2026-10-01"),
      q3End: new Date("2026-12-31"),
      q4Start: new Date("2027-01-01"),
      q4End: new Date("2027-03-31"),
      isActive: true,
    },
  });

  console.log("✅ Cycle created");

  // Create 5 goals for employee (locked/approved)
  const goalData = [
    {
      thrustArea: "Revenue Growth",
      title: "Achieve Revenue Target of $500K",
      description: "Drive sales and marketing efforts to achieve the $500K revenue target.",
      uom: "NUMERIC_MIN" as const,
      target: 500000,
      weightage: 30,
    },
    {
      thrustArea: "Customer Experience",
      title: "Reduce Customer Response Time to under 2 Hours",
      description: "Improve our support workflows to ensure all customer inquiries are responded to in under 2 hours.",
      uom: "NUMERIC_MAX" as const,
      target: 2,
      weightage: 25,
    },
    {
      thrustArea: "Product Delivery",
      title: "Launch Q3 Product Feature on Schedule",
      description: "Deliver the newly designed product feature on time with no major bugs.",
      uom: "TIMELINE" as const,
      target: 1,
      weightage: 20,
    },
    {
      thrustArea: "Health & Safety",
      title: "Zero Safety Incidents This Quarter",
      description: "Maintain a perfectly safe working environment by strictly adhering to all safety protocols.",
      uom: "ZERO" as const,
      target: 0,
      weightage: 15,
    },
    {
      thrustArea: "Learning & Development",
      title: "Complete Leadership Training Program",
      description: "Successfully complete the mandated 6-week leadership and management training program.",
      uom: "TIMELINE" as const,
      target: 1,
      weightage: 10,
    },
  ];

  const goals = await Promise.all(
    goalData.map((g) =>
      prisma.goal.create({
        data: {
          ...g,
          userId: employee.id,
          cycleId: cycle.id,
          status: "LOCKED",
          lockedAt: new Date("2025-05-01"),
        },
      })
    )
  );

  console.log("✅ Goals created");

  // Q1 achievements for 3 goals
  await prisma.achievement.create({
    data: {
      goalId: goals[0].id,
      quarter: "Q1",
      actual: 450000,
      status: "ON_TRACK",
      progressScore: (450000 / 500000) * 100, // 90%
    },
  });

  await prisma.achievement.create({
    data: {
      goalId: goals[1].id,
      quarter: "Q1",
      actual: 1.5,
      status: "COMPLETED",
      progressScore: (2 / 1.5) * 100, // 133%
    },
  });

  await prisma.achievement.create({
    data: {
      goalId: goals[2].id,
      quarter: "Q1",
      actual: 1,
      status: "COMPLETED",
      progressScore: 100, // 100%
    },
  });

  console.log("✅ Achievements created");

  // Manager check-in
  await prisma.checkin.create({
    data: {
      goalId: goals[0].id,
      managerId: manager.id,
      quarter: "Q1",
      comment: "Great progress on revenue! 84% achievement in Q1 is on track. Keep up the client acquisition momentum.",
    },
  });

  console.log("✅ Check-in created");

  // Audit logs
  await prisma.auditLog.create({
    data: {
      entityType: "Goal",
      entityId: goals[0].id,
      userId: manager.id,
      action: "APPROVE",
      oldValue: { status: "SUBMITTED" },
      newValue: { status: "LOCKED" },
    },
  });

  await prisma.auditLog.create({
    data: {
      entityType: "Goal",
      entityId: goals[1].id,
      userId: admin.id,
      action: "UNLOCK",
      oldValue: { status: "LOCKED" },
      newValue: { status: "APPROVED" },
    },
  });

  console.log("✅ Audit logs created");

  // Goals for employee 2 (in SUBMITTED state for demo)
  const goal2 = await prisma.goal.create({
    data: {
      thrustArea: "Revenue Growth",
      title: "Increase Sales Pipeline by 40%",
      description: "Build and manage sales pipeline to achieve 40% growth QoQ through targeted outreach.",
      uom: "NUMERIC_MIN",
      target: 40,
      weightage: 50,
      userId: employee2.id,
      cycleId: cycle.id,
      status: "SUBMITTED",
    },
  });

  await prisma.goal.create({
    data: {
      thrustArea: "Customer Success",
      title: "Achieve 95% Customer Retention Rate",
      description: "Maintain customer retention rate at 95% or above through proactive engagement.",
      uom: "NUMERIC_MIN",
      target: 95,
      weightage: 50,
      userId: employee2.id,
      cycleId: cycle.id,
      status: "SUBMITTED",
    },
  });

  console.log("✅ Employee 2 goals (submitted) created");

  // Escalation rule
  await prisma.escalationRule.create({
    data: {
      trigger: "CHECKIN_OVERDUE",
      daysThreshold: 7,
      notifyEmployee: true,
      notifyManager: true,
      notifyHR: false,
      isActive: true,
    },
  });

  await prisma.escalationRule.create({
    data: {
      trigger: "MANAGER_NOT_APPROVED",
      daysThreshold: 5,
      notifyEmployee: false,
      notifyManager: true,
      notifyHR: true,
      isActive: true,
    },
  });

  console.log("✅ Escalation rules created");

  console.log("\n🎉 Seed complete! Demo accounts:");
  console.log("   employee@demo.com / demo123 (EMPLOYEE)");
  console.log("   manager@demo.com  / demo123 (MANAGER)");
  console.log("   admin@demo.com    / demo123 (ADMIN)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
