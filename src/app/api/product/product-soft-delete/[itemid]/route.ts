import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const itemId = parseInt(pathname.split("/").pop() as string, 10);

    if (isNaN(itemId)) {
      return NextResponse.json({ error: "Invalid item ID" }, { status: 400 });
    }

    const [existingItem, updatedItem] = await prisma.$transaction([
      prisma.item.findUnique({
        where: { itemid: itemId },
        include: { itemimage: true },
      }),
      prisma.item.update({
        where: { itemid: itemId },
        data: { recentdelete: true },
      }),
    ]);

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem.deleted) {
      return NextResponse.json(
        { error: "Item is already marked as deleted" },
        { status: 400 }
      );
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
