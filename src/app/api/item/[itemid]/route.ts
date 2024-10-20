import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { itemid: string } }
) {
  const { itemid } = params;

  try {
    // Fetch the specific item by itemid
    const item = await prisma.item.findUnique({
      where: {
        itemid: Number(itemid), // Ensure itemid is a number
      },
      select: {
        itemid: true,
        name: true,
        type: true,
        sackweight: true,
        unitofmeasurement: true,
        stock: true,
        unitprice: true,
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
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

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

    const convertedItem = convertBigIntToString(item);

    return NextResponse.json(convertedItem, { status: 200 });
  } catch (error) {
    console.error("Error getting item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
