import { NextRequest, NextResponse } from "next/server";
import { stat, mkdir, writeFile } from "fs/promises";
import { join } from "path";
import mime from "mime";
import { PrismaClient } from "@prisma/client";

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

export const POST = async (req: NextRequest) => {
    try {
      const formData = await req.formData();
  
      const name = formData.get("name") as string;
      const typeString = formData.get("type") as string;
  
      // Verify if the typeString is a valid ItemType
      if (!Object.values(ItemType).includes(typeString as ItemType)) {
        return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
      }
  
      // Cast the string to the enum
      const type = typeString as ItemType;
  
      const quantity = parseInt(formData.get("quantity") as string, 10);
      const unitprice = parseFloat(formData.get("unitprice") as string);
      const image = formData.get("image") as File | null;
  
      if (!name || !type || isNaN(quantity) || isNaN(unitprice)) {
        return NextResponse.json({ error: "All fields are required and must be valid" }, { status: 400 });
      }
  
      let fileUrl = null;
  
      if (image) {
        if (image.size > MAX_FILE_SIZE) {
          return NextResponse.json({ error: "File is too large" }, { status: 400 });
        }
  
        if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
          return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
        }
  
        const buffer = await image.arrayBuffer();
        const relativeUploadDir = `/uploads/${new Date()
          .toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .replace(/\//g, "-")}`;
        const uploadDir = join(process.cwd(), "public", relativeUploadDir);
  
        try {
          await stat(uploadDir);
        } catch (e: any) {
          if (e.code === "ENOENT") {
            await mkdir(uploadDir, { recursive: true });
          } else {
            console.error("Error while trying to create directory when uploading a file\n", e);
            return NextResponse.json({ error: "Internal server error" }, { status: 500 });
          }
        }
  
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${image.name.replace(/\s/g, "-")}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
        await writeFile(`${uploadDir}/${filename}`, Buffer.from(buffer));
        fileUrl = `${relativeUploadDir}/${filename}`;
      }
  
      const newItem = await prisma.item.create({
        data: {
          name,
          type,
          quantity,
          unitprice,
          itemimage: fileUrl ? {
            create: {
              imagepath: fileUrl,
            },
          } : undefined,
        },
        include: {
          itemimage: true,
        },
      });
  
      return NextResponse.json(newItem, { status: 201 });
    } catch (error) {
      console.error("Error creating item:", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
  