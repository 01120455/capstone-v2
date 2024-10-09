import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      where: {
        deleted: true,
      },
      select: {
        userid: true,
        imagepath: true,
        firstname: true,
        middlename: true,
        lastname: true,
        role: true,
        status: true,
        username: true,
        password: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
