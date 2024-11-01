import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const transaction = await prisma.transaction.findMany({
      where: {
        transactiontype: "sales",
      },
      include: {
        createdbyuser: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
        lastmodifiedbyuser: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
        DocumentNumber: {
          select: {
            documentnumber: true,
          },
        },
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
          createdat: "desc",
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
