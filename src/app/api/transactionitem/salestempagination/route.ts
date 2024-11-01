import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const convertBigIntToString = (value: any): any => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(convertBigIntToString);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        convertBigIntToString(val),
      ])
    );
  }
  return value;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Use a fallback value in the parseInt
  const limit = parseInt(searchParams.get("limit") || "10");
  const page = parseInt(searchParams.get("page") || "1");

  const skip = (page - 1) * limit;

  try {
    // Fetch the relevant transactions first
    const transactions = await prisma.transaction.findMany({
      where: {
        transactiontype: "sales",
      },
      select: {
        transactionid: true,
      },
    });

    const transactionIds = transactions.map((t) => t.transactionid);

    const transactionItems = await prisma.transactionItem.findMany({
      where: {
        transactionid: {
          in: transactionIds,
        },
      },
      include: {
        Transaction: true,
        Item: true,
      },
      orderBy: {
        lastmodifiedat: "desc",
      },
      take: limit,
      skip,
    });

    const convertedItems = convertBigIntToString(transactionItems);
    return NextResponse.json(convertedItems, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
