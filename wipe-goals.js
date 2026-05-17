const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Clearing all goals...');
  await prisma.goal.deleteMany({});
  console.log('All goals deleted!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
