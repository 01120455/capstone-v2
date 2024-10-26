import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const purchaseId = parseInt(pathname.split("/").pop() as string, 10);

    if (isNaN(purchaseId)) {
      return NextResponse.json(
        { error: "Invalid purchase ID" },
        { status: 400 }
      );
    }

    const session = await getIronSession(
      req,
      NextResponse.next(),
      sessionOptions
    ); // @ts-ignore
    const userid = session.user.userid;

    const result = await prisma.$transaction(async (prisma) => {
      const existingPurchaseItem = await prisma.transactionItem.findUnique({
        where: { transactionitemid: purchaseId },
        select: {
          itemid: true,
          stock: true,
          recentdelete: true,
        },
      });

      if (!existingPurchaseItem) {
        throw new Error("Purchase Item not found");
      }

      if (existingPurchaseItem.recentdelete) {
        throw new Error("Purchase Item is already marked as deleted");
      }

      const purchaseItemStockValue = existingPurchaseItem.stock ?? 0;

      await prisma.transactionItem.update({
        where: { transactionitemid: purchaseId },
        data: {
          lastmodifiedby: userid,
          recentdelete: true,
        },
      });

      const findItem = await prisma.item.findUnique({
        where: { itemid: existingPurchaseItem.itemid },
        select: {
          stock: true,
        },
      });

      const newStockValue = (findItem?.stock ?? 0) - purchaseItemStockValue;

      await prisma.item.update({
        where: { itemid: existingPurchaseItem.itemid },
        data: {
          stock: newStockValue,
        },
      });

      return existingPurchaseItem;
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
