import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
  try {
    const items = await prisma.item.findMany({
      where: {
        deleted: true,
      },
      select: {
        itemid: true,
        name: true,
        type: true,
        sackweight: true,
        unitofmeasurement: true,
        stock: true,
        unitprice: true,
        reorderlevel: true,
        criticallevel: true,
        itemimage: {
          select: {
            imagepath: true,
          },
        },
        User: {
          select: {
            userid: true,
            firstname: true,
            middlename: true,
            lastname: true,
          },
        },
        lastmodifiedat: true,
        lastmodifiedby: true,
      },
      orderBy: {
        lastmodifiedat: "desc",
      },
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

    const convertedItems = convertBigIntToString(items);

    return NextResponse.json(convertedItems, { status: 200 });
  } catch (error) {
    console.error("Error getting purchases:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
