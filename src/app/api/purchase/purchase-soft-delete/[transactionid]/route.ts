import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
  try {
    // Parse the purchaseId from the request URL
    const { pathname } = new URL(req.url);
    const purchaseId = parseInt(pathname.split("/").pop() as string, 10);

    // Get user session
    const session = await getIronSession(
      req,
      NextResponse.next(),
      sessionOptions
    ); // @ts-ignore
    const userid = session.user.userid;

    if (isNaN(purchaseId)) {
      return NextResponse.json(
        { error: "Invalid purchase ID" },
        { status: 400 }
      );
    }

    const [existingPurchaseItem, existingPurchase] = await prisma.$transaction([
      prisma.transactionItem.findFirst({
        where: { transactionid: purchaseId },
      }),
      prisma.transaction.findFirst({
        where: { transactionid: purchaseId },
      }),
    ]);

    if (!existingPurchaseItem) {
      return NextResponse.json(
        { error: "Purchase Item not found" },
        { status: 404 }
      );
    }

    // if (existingPurchaseItem.recentdelete) {
    //   return NextResponse.json(
    //     { error: "Purchase Item is already marked as deleted" },
    //     { status: 400 }
    //   );
    // }

    if (!existingPurchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    if (existingPurchase.recentdelete) {
      return NextResponse.json(
        { error: "Purchase is already marked as deleted" },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.transactionItem.update({
        where: { transactionitemid: existingPurchaseItem.transactionitemid },
        data: {
          lastmodifiedby: userid,
          recentdelete: true,
        },
      }),
      prisma.transaction.update({
        where: { transactionid: existingPurchase.transactionid },
        data: {
          lastmodifiedby: userid,
          recentdelete: true,
        },
      }),
    ]);

    const findTransactionItems = await prisma.transactionItem.findMany({
      where: {
        transactionid: purchaseId,
        recentdelete: false,
      },
      select: {
        itemid: true,
        stock: true,
      },
    });

    await Promise.all(
      findTransactionItems.map(async (item) => {
        const purchaseItemStockValue = item.stock;

        await prisma.item.update({
          where: { itemid: item.itemid },
          data: {
            stock: {
              decrement: purchaseItemStockValue,
            },
          },
        });
      })
    );

    return NextResponse.json(existingPurchase, { status: 200 });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
