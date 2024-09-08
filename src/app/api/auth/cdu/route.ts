// src/app/api/createDummyUser/route.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST() {
  try {
    // Check if there are any users other than the admin
    const otherUsers = await prisma.user.findMany({
      where: {
        NOT: { username: "admin" },
      },
    });

    if (otherUsers.length > 0) {
      // Delete the admin user if other users exist
      await prisma.user.deleteMany({
        where: { username: "admin" },
      });

      console.log("Admin user deleted because other users exist.");
      return NextResponse.json({
        message: "Admin user deleted because other users exist.",
      });
    }

    // Check if the admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: "admin" },
    });

    if (!existingUser) {
      // Create the user if not found
      const hashedPassword = await bcrypt.hash("admin", 10); // Change to a secure password

      const user = await prisma.user.create({
        data: {
          username: "admin",
          firstname: "Shane Raylene",
          middlename: "Repato",
          lastname: "Velarde",
          password: hashedPassword,
          role: "admin",
          status: "active",
        },
      });

      console.log("Static user created successfully!", user);
      return NextResponse.json({ message: "Dummy user created" });
    } else {
      console.log("Static user already exists.");
      return NextResponse.json({ message: "Dummy user already exists" });
    }
  } catch (error) {
    console.error("Error creating dummy user:", error);
    return NextResponse.json({ error: "Error creating dummy user" });
  } finally {
    await prisma.$disconnect();
  }
}
