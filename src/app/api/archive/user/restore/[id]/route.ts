import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const id = parseInt(pathname.split("/").pop() as string, 10);

    const updateUser = await prisma.$transaction(async (prisma) => {
      const existingUser = await prisma.user.findUnique({
        where: { userid: id, deleted: true },
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      const updateUser = await prisma.user.update({
        where: { userid: id },
        data: { deleted: false, status: "active" },
      });

      return updateUser;
    });

    return NextResponse.json(updateUser, { status: 200 });
  } catch (error) {
    console.error("Error restoring user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
