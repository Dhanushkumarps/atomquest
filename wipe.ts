import { prisma } from "./lib/prisma";

async function main() {
  console.log('Clearing related entities...');
  await prisma.achievement.deleteMany({});
  await prisma.checkin.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.goal.deleteMany({});
  console.log('Successfully wiped all goals and related records!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
