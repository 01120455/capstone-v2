import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const period = searchParams.get("period");

    // console.log(
    //   "startDate:",
    //   startDate,
    //   "endDate:",
    //   endDate,
    //   "period:",
    //   period
    // );

    const whereClause: any = {
      Transaction: {},
      Item: {},
    };

    if (startDate && endDate) {
      whereClause.Transaction = {
        transactiontype: "sales",
        lastmodifiedat: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
      };
      whereClause.Item = {
        lastmodifiedat: {
          gte: new Date(startDate).toISOString(),
          lte: new Date(endDate).toISOString(),
        },
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

      whereClause.Transaction = {
        transactiontype: "sales",
        lastmodifiedat: {
          gte: periodStartDate,
          lte: now,
        },
      };
      whereClause.Item = {
        lastmodifiedat: {
          gte: periodStartDate,
          lte: now,
        },
      };
    }

    // console.log("Where Clause:", whereClause);

    const cogs = await prisma.transactionItem.aggregate({
      _sum: {
        totalamount: true,
      },
      where: {
        transactionid: {
          in: await prisma.transaction
            .findMany({
              where: whereClause.Transaction,
              select: {
                transactionid: true,
              },
            })
            .then((transactions) =>
              transactions.map((transaction) => transaction.transactionid)
            ),
        },
      },
    });

    const avgInventory = await prisma.item.aggregate({
      _avg: {
        stock: true,
      },
      where: whereClause.Item,
    });

    // If no data is found, return 0 for stockTurnoverRate
    if (!cogs._sum.totalamount || !avgInventory._avg.stock) {
      // console.log("No data found for the given period or active items.");
      return NextResponse.json(
        { stockTurnoverRate: 0 }, // Return stockTurnoverRate as 0
        { status: 200 } // Status 200 indicating success
      );
    }

    const stockTurnoverRate = cogs._sum.totalamount / avgInventory._avg.stock;

    // console.log("COGS:", cogs._sum.totalamount);
    // console.log("Average Inventory:", avgInventory._avg.stock);

    // console.log("Stock Turnover Rate:", stockTurnoverRate);

    return NextResponse.json({ stockTurnoverRate }, { status: 200 });
  } catch (error) {
    console.error("Error calculating Stock Turnover Rate:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
