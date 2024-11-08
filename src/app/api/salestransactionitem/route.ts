import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const transactionItems = await prisma.transactionItem.findMany({
      include: {
        Transaction: true,
        Item: true,
      },
      orderBy: {
        lastmodifiedat: "desc",
      },
    });

    return NextResponse.json(transactionItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
