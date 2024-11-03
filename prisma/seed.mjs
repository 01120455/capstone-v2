import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "repatobain@gmail.com";
  const existingUser = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  console.log("Creating user");
  const hashedPassword = await bcrypt.hash("IamBatman", 10); // Change to a secure password

  await prisma.user.create({
    data: {
      email: email,
      firstname: "Bain Hansly",
      middlename: "Cruz",
      lastname: "Repato",
      password: hashedPassword,
      role: "admin",
      status: "active",
      imagepath: "/uploads/user_image/Bain_Hansly_Cruz_Repato/bainhansly.png",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("An error occurred:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
