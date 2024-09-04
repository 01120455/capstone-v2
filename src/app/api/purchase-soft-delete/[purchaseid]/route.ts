import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
  try {
    // Parse the itemId from the request URL
    const { pathname } = new URL(req.url);
    const purchaseId = parseInt(pathname.split("/").pop() as string, 10);

    if (isNaN(purchaseId)) {
      return NextResponse.json({ error: "Invalid purchase ID" }, { status: 400 });
    }

    const existingPurchaseItem = await prisma.purchaseItem.findFirst({
      where: { purchaseid: purchaseId },
    });

    if (!existingPurchaseItem) {
      return NextResponse.json({ error: "Purchase Item not found" }, { status: 404 });
    }

    if (existingPurchaseItem.purchaseitemdeleted) {
      return NextResponse.json(
        { error: "Purchase Item is already marked as deleted" },
        { status: 400 }
      );
    }

    const updatedPurchaseItem = await prisma.purchaseItem.update({
      where: { purchaseitemid: existingPurchaseItem.purchaseitemid },
      data: { purchaseitemdeleted: true },
    });

    const existingPurchase = await prisma.purchase.findFirst({
      where: { purchaseid: purchaseId },
    });

    if (!existingPurchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    if (existingPurchase.purchasedeleted) {
      return NextResponse.json(
        { error: "Purchase is already marked as deleted" },
        { status: 400 }
      );
    }

    const updatedPurchase = await prisma.purchase.update({
      where: { purchaseid: existingPurchase.purchaseid },
      data: { purchasedeleted: true },
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
