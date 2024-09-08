import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
  try {
    // Parse the itemId from the request URL
    const { pathname } = new URL(req.url);
    const purchaseId = parseInt(pathname.split("/").pop() as string, 10);

    const session = await getIronSession(
      req,
      NextResponse.next(),
      sessionOptions
    );
    const userid = session.user.userid;

    if (isNaN(purchaseId)) {
      return NextResponse.json(
        { error: "Invalid purchase ID" },
        { status: 400 }
      );
    }

    const existingPurchaseItem = await prisma.transactionItem.findFirst({
      where: { transactionid: purchaseId },
    });

    if (!existingPurchaseItem) {
      return NextResponse.json(
        { error: "Purchase Item not found" },
        { status: 404 }
      );
    }

    if (existingPurchaseItem.deleted) {
      return NextResponse.json(
        { error: "Purchase Item is already marked as deleted" },
        { status: 400 }
      );
    }

    const updatedPurchaseItem = await prisma.transactionItem.update({
      where: { transactionitemid: existingPurchaseItem.transactionitemid },
      data: {
        lastmodifiedby: userid,
        deleted: true,
      },
    });

    const existingPurchase = await prisma.transaction.findFirst({
      where: { transactionid: purchaseId },
    });

    if (!existingPurchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    if (existingPurchase.deleted) {
      return NextResponse.json(
        { error: "Purchase is already marked as deleted" },
        { status: 400 }
      );
    }

    const updatedPurchase = await prisma.transaction.update({
      where: { transactionid: existingPurchase.transactionid },
      data: {
        lastmodifiedby: userid,
        deleted: true,
      },
    });

    return NextResponse.json(updatedPurchase, { status: 200 });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
