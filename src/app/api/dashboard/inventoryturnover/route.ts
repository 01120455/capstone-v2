import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    const startDate = searchParams.get("startDate"); 
    const endDate = searchParams.get("endDate"); 
    const period = searchParams.get("period"); 

    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.lastmodifiedat = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (period) {
      const now = new Date();
      let periodStartDate = new Date();

      switch (period) {
        case "7days":
          periodStartDate.setDate(now.getDate() - 7);
          break;
        case "1month":
          periodStartDate.setMonth(now.getMonth() - 1);
          break;
        case "6months":
          periodStartDate.setMonth(now.getMonth() - 6);
          break;
        case "1year":
          periodStartDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          periodStartDate.setDate(now.getDate() - 7);
      }

      whereClause.lastmodifiedat = {
        gte: periodStartDate,
        lte: now,
      };
    }

    const itemsData = await prisma.item.findMany({
      select: {
        itemid: true,
        itemname: true,
        stock: true,
      },
    });

    const transactionItemData = await prisma.transactionItem.findMany({
      where: {
        ...whereClause,
        itemid: { in: itemsData.map((item) => item.itemid) },
      },
      select: {
        itemid: true,
        totalamount: true,
      },
    });

    const itemSalesData = itemsData.map((item) => {
      const relatedSales = transactionItemData.filter(
        (transactionItem) => transactionItem.itemid === item.itemid
      );

      const totalSales = relatedSales.reduce(
        (acc, transactionItem) => acc + (transactionItem.totalamount || 0),
        0
      );

      const turnoverRate =
        item.stock > 0 ? (totalSales / item.stock).toFixed(2) : "0";

      return {
        itemname: item.itemname,
        turnoverRate: parseFloat(turnoverRate),
        stock: item.stock,
        totalSales,
      };
    });

    return NextResponse.json(itemSalesData);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "An unknown error occurred." },
        { status: 500 }
      );
    }
  }
}
