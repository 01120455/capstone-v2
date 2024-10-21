import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const id = parseInt(pathname.split("/").pop() as string, 10);

    const updateTransaction = await prisma.$transaction(async (prisma) => {
      const existingTransaction = await prisma.transaction.findUnique({
        where: { transactionid: id, type: "sales" },
      });

      if (!existingTransaction) {
        throw new Error("Transaction not found");
      }

      const updateTransactionItem = await prisma.transactionItem.updateMany({
        where: { transactionid: id, recentdelete: true },
        data: { recentdelete: false },
      });

      const updateTransaction = await prisma.transaction.update({
        where: { transactionid: id, type: "sales" },
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
