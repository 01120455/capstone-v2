import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const id = parseInt(pathname.split("/").pop() as string, 10);

    const updateTransaction = await prisma.$transaction(async (prisma) => {
      const existingTransaction = await prisma.transaction.findUnique({
        where: { transactionid: id, type: "purchase" },
      });

      if (!existingTransaction) {
        throw new Error("Transaction not found");
      }

      const existingPurchaseItems = await prisma.transactionItem.findMany({
        where: { transactionid: id, recentdelete: true },
        select: {
          itemid: true,
          stock: true,
        },
      });

      if (!existingPurchaseItems.length) {
        const updateTransaction = await prisma.transaction.update({
          where: { transactionid: id, type: "purchase" },
          data: { recentdelete: false },
        });
      }

      await Promise.all(
        existingPurchaseItems.map(async (item) => {
          const purchaseItemStockValue = item.stock ?? 0;

          await prisma.item.update({
            where: { itemid: item.itemid },
            data: {
              stock: {
                increment: purchaseItemStockValue,
              },
            },
          });
        })
      );

      const updateTransactionItem = await prisma.transactionItem.updateMany({
        where: { transactionid: id, recentdelete: true },
        data: { recentdelete: false },
      });

      const updateTransaction = await prisma.transaction.update({
        where: { transactionid: id, type: "purchase" },
        data: { recentdelete: false },
      });

      return updateTransaction;
    });

    return NextResponse.json(updateTransaction, { status: 200 });
  } catch (error) {
    console.error("Error restoring user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
