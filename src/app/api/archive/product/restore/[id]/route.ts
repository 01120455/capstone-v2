import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const id = parseInt(pathname.split("/").pop() as string, 10);

    const updateItem = await prisma.$transaction(async (prisma) => {
      const existingItem = await prisma.item.findUnique({
        where: { itemid: id, recentdelete: true },
      });

      if (!existingItem) {
        throw new Error("Item not found");
      }

      const updateItem = await prisma.item.update({
        where: { itemid: id },
        data: { recentdelete: false },
      });

      return updateItem;
    });

    return NextResponse.json(updateItem, { status: 200 });
  } catch (error) {
    console.error("Error restoring Item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
