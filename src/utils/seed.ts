// prisma/seed.ts

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { username: 'admin' }, // Change to your static user's identifier (e.g., email)
  });

  if (!existingUser) {
    // Create the user if not found
    const hashedPassword = await bcrypt.hash('admin', 10); // Change to a secure password

    await prisma.user.create({
      data: {
        username: 'admin', 
        firstname: 'Bain Hansly',
        middlename: 'Cruz',
        lastname: 'Repato',
        password: hashedPassword,
        role: 'admin', 
        status: 'active',
      },
    });

    console.log('Static user created successfully!');
  } else {
    console.log('Static user already exists.');
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
