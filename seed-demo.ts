import { prisma } from "./lib/prisma";

async function main() {
  console.log('Seeding demo goal for AI check-in...');
  
  // Get employee
  const employee = await prisma.user.findUnique({ where: { email: 'employee@demo.com' } });
  if (!employee) throw new Error("Employee not found");

  // Get or create cycle
  let cycle = await prisma.cycle.findFirst({ where: { isActive: true } });
  if (!cycle) {
    const now = new Date();
    cycle = await prisma.cycle.create({
      data: {
        name: 'FY2026',
        isActive: true,
        goalSettingStart: new Date(now.getFullYear(), 0, 1),
        goalSettingEnd: new Date(now.getFullYear(), 2, 31),
        q1Start: new Date(now.getFullYear(), 0, 1),
        q1End: new Date(now.getFullYear(), 2, 31),
        q2Start: new Date(now.getFullYear(), 3, 1),
        q2End: new Date(now.getFullYear(), 5, 30),
        q3Start: new Date(now.getFullYear(), 6, 1),
        q3End: new Date(now.getFullYear(), 8, 30),
        q4Start: new Date(now.getFullYear(), 9, 1),
        q4End: new Date(now.getFullYear(), 11, 31),
      }
    });
  }

  // Create a LOCKED goal (Check-ins only work on LOCKED goals)
  const goal = await prisma.goal.create({
    data: {
      userId: employee.id,
      cycleId: cycle.id,
      thrustArea: 'Revenue Growth',
      title: 'Launch Enterprise Tier & Secure 5 Clients',
      description: 'Develop and launch the new enterprise tier of our product, including advanced security features, and onboard at least 5 new enterprise clients by end of year.',
      uom: 'NUMERIC_MIN',
      target: 5,
      weightage: 40,
      status: 'LOCKED',
      lockedAt: new Date(),
    }
  });

  // Create an achievement for AI to summarize
  await prisma.achievement.create({
    data: {
      goalId: goal.id,
      quarter: 'Q1',
      actual: 2,
      status: 'ON_TRACK',
      progressScore: 40,
      notes: 'Successfully launched the Enterprise tier beta. We have secured 2 clients so far (Acme Corp and Globex). The sales pipeline looks very strong for Q2. However, we are seeing some delays in the SSO integration feature which might push back our next two prospects by a couple of weeks. Will need engineering support to prioritize SSO.'
    }
  });

  console.log('Successfully seeded a LOCKED goal and Q1 progress! AI Summary should now work perfectly.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
