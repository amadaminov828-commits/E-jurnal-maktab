const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const schools = await prisma.school.findMany({
    include: {
      classes: {
        include: {
          students: true
        }
      }
    }
  });

  console.log(JSON.stringify(schools, null, 2));
}

main().finally(() => prisma.$disconnect());
