import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const transactionId = parseInt(pathname.split("/").pop() as string, 10);

  if (isNaN(transactionId)) {
    return NextResponse.json(
      { error: "Invalid transactionId" },
      { status: 400 }
    );
  }

  try {
    const transactionItems = await prisma.transactionItem.findMany({
      where: {
        transactionid: transactionId,
        recentdelete: false,
      },
      include: {
        Transaction: true,
        Item: true,
      },
      orderBy: {
        lastmodifiedat: "desc",
      },
    });

    if (transactionItems.length === 0) {
      return NextResponse.json(
        { error: "No transaction items found" },
        { status: 404 }
      );
    }

    return NextResponse.json(transactionItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching transaction items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
