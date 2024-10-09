import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("MorganFreeman", 10); // Change to a secure password

  const user = await prisma.user.create({
    data: {
      username: "F0X9011",
      firstname: "Lucius",
      middlename: "Kadeem",
      lastname: "Fox",
      password: hashedPassword,
      role: "admin",
      status: "active",
      imagepath:
        "/uploads/user_image/Lucius_Fox/luciusfox_jpg-1727014234081-541908937.jpeg",
      deleted: false,
    },
  });
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
