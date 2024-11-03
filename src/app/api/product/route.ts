import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { stat, mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import mime from "mime";
import _ from "lodash";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

enum ItemType {
  bigas = "bigas",
  palay = "palay",
  resico = "resico",
}

enum SackWeight {
  bag25kg = "bag25kg",
  cavan50kg = "cavan50kg",
}

enum UnitOfMeasurement {
  quantity = "quantity",
  weight = "weight",
}

export const POST = async (req: NextRequest) => {
  try {
    const session = await getIronSession(
      req,
      NextResponse.next(),
      sessionOptions
    ); // @ts-ignore
    const userid = session.user.userid;

    const formData = await req.formData();
    const name = formData.get("itemname") as string;
    const typeString = formData.get("itemtype") as string;
    const sackweightString = formData.get("sackweight") as string;
    const unitofmeasurementString = formData.get("unitofmeasurement") as string;
    const stock = parseFloat(formData.get("stock") as string);
    const unitprice = parseFloat(formData.get("unitprice") as string);
    const image = formData.get("image") as File | null;

    if (!Object.values(ItemType).includes(typeString as ItemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    const type = typeString as ItemType;

    if (!Object.values(SackWeight).includes(sackweightString as SackWeight)) {
      return NextResponse.json(
        { error: "Invalid sack weight" },
        { status: 400 }
      );
    }

    const sackweight = sackweightString as SackWeight;

    if (
      !Object.values(UnitOfMeasurement).includes(
        unitofmeasurementString as UnitOfMeasurement
      )
    ) {
      return NextResponse.json(
        { error: "Invalid unit of measurement" },
        { status: 400 }
      );
    }
    const unitofmeasurement = unitofmeasurementString as UnitOfMeasurement;

    if (isNaN(stock) || isNaN(unitprice)) {
      return NextResponse.json(
        {
          error:
            "Stock and unit price must be valid numbers and not negative values",
        },
        { status: 400 }
      );
    }

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    let fileUrl = null;

    if (image) {
      if (image.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "File is too large" },
          { status: 400 }
        );
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
        return NextResponse.json(
          { error: "Invalid file type" },
          { status: 400 }
        );
      }

      const buffer = await image.arrayBuffer();
      const sanitizedFolderName = name.replace(/[^a-zA-Z0-9-_]/g, "_");
      const relativeUploadDir = `/uploads/product_image/${sanitizedFolderName}`;
      const uploadDir = join(process.cwd(), "public", relativeUploadDir);

      try {
        await stat(uploadDir);
      } catch (e: any) {
        if (e.code === "ENOENT") {
          await mkdir(uploadDir, { recursive: true });
        } else {
          console.error("Error while creating directory for file upload", e);
          return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          );
        }
      }

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${image.name.replace(
        /\s/g,
        "-"
      )}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
      await writeFile(`${uploadDir}/${filename}`, Buffer.from(buffer));
      fileUrl = `${relativeUploadDir}/${filename}`;
    }

    const [existingItem, result] = await prisma.$transaction(async (tx) => {
      const existingItem = await tx.item.findFirst({
        where: {
          itemname: name,
          itemtype: type,
          unitofmeasurement,
          sackweight,
        },
      });

      if (existingItem) {
        const existingItemStock = existingItem.stock ?? 0;
        const newStock = existingItemStock + stock;
        const updatedItem = await tx.item.update({
          where: { itemid: existingItem.itemid },
          data: {
            sackweight,
            stock: newStock,
            unitprice,
            lastmodifiedby: userid,
            imagepath: fileUrl,
          },
        });
        return [existingItem, updatedItem];
      } else {
        const newItem = await tx.item.create({
          data: {
            itemname: name,
            itemtype: type,
            sackweight,
            status: "active",
            unitofmeasurement,
            stock,
            unitprice,
            lastmodifiedby: userid,
            imagepath: fileUrl,
          },
        });
        return [null, newItem];
      }
    });
    if (existingItem) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 201 });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export async function GET(req: NextRequest) {
  try {
    const items = await prisma.item.findMany({
      select: {
        itemid: true,
        itemname: true,
        itemtype: true,
        sackweight: true,
        status: true,
        unitofmeasurement: true,
        stock: true,
        unitprice: true,
        imagepath: true,
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

export const PUT = async (req: NextRequest) => {
  try {
    const session = await getIronSession(
      req,
      NextResponse.next(),
      sessionOptions
    ); // @ts-ignore
    const userid = session.user.userid;

    const formData = await req.formData();
    const itemId = parseInt(formData.get("itemid") as string, 10);
    const name = formData.get("itemname") as string;
    const typeString = formData.get("itemtype") as string;
    const sackweightString = formData.get("sackweight") as string;
    const unitofmeasurementString = formData.get("unitofmeasurement") as string;
    const stock = parseFloat(formData.get("stock") as string);
    const unitprice = parseFloat(formData.get("unitprice") as string);
    const image = formData.get("image") as File | null;

    if (!Object.values(SackWeight).includes(sackweightString as SackWeight)) {
      return NextResponse.json(
        { error: "Invalid sack weight" },
        { status: 400 }
      );
    }

    const sackweight = sackweightString as SackWeight;

    if (
      !Object.values(UnitOfMeasurement).includes(
        unitofmeasurementString as UnitOfMeasurement
      )
    ) {
      return NextResponse.json(
        { error: "Invalid unit of measurement" },
        { status: 400 }
      );
    }

    const unitofmeasurement = unitofmeasurementString as UnitOfMeasurement;

    if (isNaN(stock) || isNaN(unitprice)) {
      return NextResponse.json(
        {
          error:
            "Stock and unit price must be valid numbers and not negative values",
        },
        { status: 400 }
      );
    }

    if (!Object.values(ItemType).includes(typeString as ItemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    const type = typeString as ItemType;

    if (!name || !type || !sackweight || isNaN(unitprice) || isNaN(itemId)) {
      return NextResponse.json(
        { error: "All fields are required and must be valid to be updated" },
        { status: 400 }
      );
    }

    // Start transaction
    const [existingItem, updatedItem] = await prisma.$transaction(
      async (tx) => {
        const existingItem = await tx.item.findUnique({
          where: { itemid: itemId },
        });

        if (!existingItem) {
          throw new Error("Item not found");
        }

        let fileUrl = null;

        if (image) {
          if (image.size > MAX_FILE_SIZE) {
            throw new Error("File is too large");
          }

          if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
            throw new Error("Invalid file type");
          }

          const buffer = await image.arrayBuffer();
          const sanitizedFolderName = name.replace(/[^a-zA-Z0-9-_]/g, "_");
          const relativeUploadDir = `/uploads/product_image/${sanitizedFolderName}`;
          const uploadDir = join(process.cwd(), "public", relativeUploadDir);

          try {
            await stat(uploadDir);
          } catch (e: any) {
            if (e.code === "ENOENT") {
              await mkdir(uploadDir, { recursive: true });
            } else {
              throw e;
            }
          }

          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}`;
          const filename = `${image.name.replace(
            /\s/g,
            "-"
          )}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
          await writeFile(`${uploadDir}/${filename}`, Buffer.from(buffer));
          fileUrl = `${relativeUploadDir}/${filename}`;

          if (existingItem.imagepath) {
            const oldImagePath = join(
              process.cwd(),
              "public",
              existingItem.imagepath
            );
            try {
              await unlink(oldImagePath);
            } catch (e: any) {
              console.error("Error deleting old image file\n", e);
            }
          }
        }

        const updatedItem = await tx.item.update({
          where: { itemid: itemId },
          data: {
            itemname: name,
            itemtype: type,
            sackweight,
            status: "active",
            unitofmeasurement,
            stock,
            unitprice,
            lastmodifiedby: userid,
            imagepath: fileUrl,
          },
        });

        return [existingItem, updatedItem];
      }
    );

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { itemid } = await z
      .object({
        itemid: z.number(),
      })
      .parseAsync(body);

    const itemFound = await prisma.item.findUnique({
      where: {
        itemid,
      },
    });

    if (!itemFound) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    const deleteItem = await prisma.item.delete({
      where: { itemid },
    });

    return NextResponse.json(deleteItem, { status: 200 });
  } catch (error) {
    console.error("Error deleting Item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
