import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import item, { item as itemSchema } from "../../../schemas/item.schema";
import { z } from "zod";

const prisma = new PrismaClient();

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const {
      name,
        type,
        quantity,
        unitprice,
        // imageurl,
    } = await itemSchema.parseAsync(body);

    
    const createItem = await prisma.item.create({
      data : {
        name,
        type,
        quantity,
        unitprice,
      },
    });


    return NextResponse.json(createItem, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.item.findMany({
      select: {
        itemid: true,
        name: true,
        type: true,
        quantity: true,
        unitprice: true,
      },
    });

    return NextResponse.json(items, { status: 200 });
  }
  catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const PUT = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const {
        itemid,
        name,
        type,
        quantity,
        unitprice,
        imageurl,
    } = await itemSchema.parseAsync(body);

    let itemFound = await prisma.item.findFirst({
      where: {
        itemid,
      },
    });

    if (!itemFound) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    } else {
      // Update the user
      const updateItem = await prisma.item.update({
        where: { itemid },
        data: {
            name,
            type,
            quantity,
            unitprice,
        },
      });

      return NextResponse.json(updateItem, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const DELETE = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { itemid } = await z.object({
      itemid: z.number(),
    }).parseAsync(body);

    let itemFound = await prisma.item.findFirst({
      where: {
        itemid,
      },
    });

    if (!itemFound) {
      return NextResponse.json(
        { error: "Item not found" },
        { status: 404 }
      );
    } else {
      // Delete the user
      const deleteItem = await prisma.item.delete({
        where: { itemid },
      });

      return NextResponse.json(deleteItem, { status: 200 });
    }
  } catch (error) {
    console.error("Error deleting Item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

