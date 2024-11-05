// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export async function GET(req: NextRequest) {
//   try {
//     const transaction = await prisma.transaction.findMany({
//       where: {
//         transactiontype: "purchase",
//         status: "paid",
//         frommilling: true,
//       },
//       include: {
//         TransactionItem: {
//           select: {
//             transactionid: true,
//             Item: {
//               select: {
//                 itemname: true,
//                 itemtype: true,
//                 sackweight: true,
//               },
//             },
//             transactionitemid: true,
//             sackweight: true,
//             unitofmeasurement: true,
//             stock: true,
//             unitprice: true,
//             totalamount: true,
//             lastmodifiedat: true,
//           },
//         },
//       },
//       orderBy: [
//         {
//           createdat: "desc", // First sort by createdat in descending order
//         },
//       ],
//     });

//     const convertBigIntToString = (value: any): any => {
//       if (value instanceof Date) {
//         return value.toISOString();
//       }
//       if (typeof value === "bigint") {
//         return value.toString();
//       }
//       if (Array.isArray(value)) {
//         return value.map(convertBigIntToString);
//       }
//       if (value !== null && typeof value === "object") {
//         return Object.fromEntries(
//           Object.entries(value).map(([key, val]) => [
//             key,
//             convertBigIntToString(val),
//           ])
//         );
//       }
//       return value;
//     };
//     // console.log("Raw transaction data:", transaction);

//     const convertedTransaction = convertBigIntToString(transaction);

//     // console.log("Converted transaction data:", convertedTransaction);

//     return NextResponse.json(convertedTransaction, { status: 200 });
//   } catch (error) {
//     console.error("Error getting purchases:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    // Get filter values from searchParams matching your frontend
    const startDate = searchParams.get("startDate"); // Changed from startdate to startDate
    const endDate = searchParams.get("endDate"); // Changed from enddate to endDate
    const period = searchParams.get("period"); // Added period parameter

    // Build the where clause based on filters
    const whereClause: any = {
      transactiontype: "purchase",
      status: "paid",
    };

    if (startDate && endDate) {
      // Date range filter
      whereClause.lastmodifiedat = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (period) {
      // Period filter
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
          // Default to last 7 days if period is invalid
          periodStartDate.setDate(now.getDate() - 7);
      }

      whereClause.lastmodifiedat = {
        gte: periodStartDate,
        lte: now,
      };
    }

    const transaction = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        TransactionItem: {
          select: {
            transactionid: true,
            Item: {
              select: {
                itemname: true,
                itemtype: true,
                sackweight: true,
              },
            },
            transactionitemid: true,
            sackweight: true,
            unitofmeasurement: true,
            stock: true,
            unitprice: true,
            totalamount: true,
            lastmodifiedat: true,
          },
        },
      },
      orderBy: [
        {
          createdat: "desc", // First sort by createdat in descending order
        },
      ],
    });

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
    // console.log("Raw transaction data:", transaction);

    const convertedTransaction = convertBigIntToString(transaction);

    // console.log("Converted transaction data:", convertedTransaction);

    return NextResponse.json(convertedTransaction, { status: 200 });
  } catch (error) {
    console.error("Error getting purchases:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
