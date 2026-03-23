const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@library.com' },
    update: {},
    create: {
      email: 'admin@library.com',
      nom: 'Admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const livre1 = await prisma.livre.create({
    data: {
      titre: '1984',
      auteur: 'George Orwell',
      annee: 1949,
      genre: 'Dystopian',
    },
  });

  const livre2 = await prisma.livre.create({
    data: {
      titre: 'To Kill a Mockingbird',
      auteur: 'Harper Lee',
      annee: 1960,
      genre: 'Fiction',
    },
  });

  console.log({ admin, livre1, livre2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
