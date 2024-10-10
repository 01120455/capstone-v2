import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const userId = parseInt(pathname.split("/").pop() as string, 10);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Use a transaction to ensure atomicity of operations
    const [existingUser, updatedUser] = await prisma.$transaction([
      prisma.user.findUnique({
        where: { userid: userId },
      }),
      prisma.user.update({
        where: { userid: userId },
        data: { deleted: true, status: "inactive" },
      }),
    ]);

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (existingUser.deleted) {
      return NextResponse.json(
        { error: "User is already marked as deleted" },
        { status: 400 }
      );
    }

    // logging the deletion para sa user activity logs
    // await prisma.deletionLog.create({
    //   data: {
    //     itemId: itemId,
    //     deletedAt: new Date(),
    //   },
    // });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
