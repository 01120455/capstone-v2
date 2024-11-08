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

  const limit = parseInt(searchParams.get("limit") || "10");
  const page = parseInt(searchParams.get("page") || "1");
  const skip = (page - 1) * limit;

  const documentNumberFilter = searchParams.get("documentnumber") || "";
  const itemNameFilter = searchParams.get("name") || "";
  const walkinFilter = searchParams.get("walkin") || "";
  const statusFilter = searchParams.get("status") || "";

  const startDateFilter = searchParams.get("startdate");
  const endDateFilter = searchParams.get("enddate");

  const startDate = startDateFilter ? new Date(startDateFilter) : null;
  const endDate = endDateFilter ? new Date(endDateFilter) : null;

  try {
    const whereClause: any = {
      transactiontype: "sales",
    };

    if (documentNumberFilter) {
      whereClause.DocumentNumber = {
        documentnumber: documentNumberFilter,
      };
    }
    if (itemNameFilter) {
      whereClause.TransactionItem = {
        some: {
          Item: {
            itemname: itemNameFilter,
          },
        },
      };
    }
    if (walkinFilter) {
      whereClause.walkin = walkinFilter === "true"; 
    }
    if (statusFilter) {
      whereClause.status = statusFilter;
    }
    if (startDate && endDate) {
      whereClause.createdat = {
        gte: startDate,
        lte: endDate,
      };
    } else if (startDate) {
      whereClause.createdat = {
        gte: startDate,
      };
    } else if (endDate) {
      whereClause.createdat = {
        lte: endDate,
      };
    }

    const purchases = await prisma.transaction.findMany({
      where: whereClause,
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
          include: {
            Item: {
              select: {
                itemname: true,
                itemtype: true,
                sackweight: true,
              },
            },
          },
        },
      },
      orderBy: {
        lastmodifiedat: "desc",
      },
      take: limit,
      skip,
    });

    const convertedItems = convertBigIntToString(purchases);
    return NextResponse.json(convertedItems, { status: 200 });
  } catch (error) {
    console.error("Error getting items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
