import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { stat, mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import mime from "mime";
import _ from "lodash";

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

// export const POST = async (req: NextRequest) => {
//   try {
//     const formData = await req.formData();

//     const name = formData.get("name") as string;
//     const typeString = formData.get("type") as string;

//     // Verify if the typeString is a valid ItemType
//     if (!Object.values(ItemType).includes(typeString as ItemType)) {
//       return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
//     }

//     // Cast the string to the enum
//     const type = typeString as ItemType;

//     const quantity = parseInt(formData.get("quantity") as string, 10);
//     const unitprice = parseFloat(formData.get("unitprice") as string);
//     const image = formData.get("image") as File | null;

//     if (!name || !type || isNaN(quantity) || isNaN(unitprice)) {
//       return NextResponse.json(
//         { error: "All fields are required and must be valid to be added" },
//         { status: 400 }
//       );
//     }

//     let fileUrl = null;

//     if (image) {
//       if (image.size > MAX_FILE_SIZE) {
//         return NextResponse.json(
//           { error: "File is too large" },
//           { status: 400 }
//         );
//       }

//       if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
//         return NextResponse.json(
//           { error: "Invalid file type" },
//           { status: 400 }
//         );
//       }

//       const buffer = await image.arrayBuffer();
//       const relativeUploadDir = `/uploads/${new Date()
//         .toLocaleDateString("id-ID", {
//           day: "2-digit",
//           month: "2-digit",
//           year: "numeric",
//         })
//         .replace(/\//g, "-")}`;
//       const uploadDir = join(process.cwd(), "public", relativeUploadDir);

//       try {
//         await stat(uploadDir);
//       } catch (e: any) {
//         if (e.code === "ENOENT") {
//           await mkdir(uploadDir, { recursive: true });
//         } else {
//           console.error(
//             "Error while trying to create directory when uploading a file\n",
//             e
//           );
//           return NextResponse.json(
//             { error: "Internal server error" },
//             { status: 500 }
//           );
//         }
//       }

//       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//       const filename = `${image.name.replace(
//         /\s/g,
//         "-"
//       )}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
//       await writeFile(`${uploadDir}/${filename}`, Buffer.from(buffer));
//       fileUrl = `${relativeUploadDir}/${filename}`;
//     }

//     const newItem = await prisma.item.create({
//       data: {
//         name,
//         type,
//         quantity,
//         unitprice,
//         itemimage: fileUrl
//           ? {
//               create: {
//                 imagepath: fileUrl,
//               },
//             }
//           : undefined,
//       },
//       include: {
//         itemimage: true,
//       },
//     });

//     return NextResponse.json(newItem, { status: 201 });
//   } catch (error) {
//     console.error("Error creating item:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// };

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
      return NextResponse.json(
        { error: "All fields are required and must be valid to be added" },
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

      // Sanitize the name to create a valid folder name
      const sanitizedFolderName = name.replace(/[^a-zA-Z0-9-_]/g, "_");
      const relativeUploadDir = `/uploads/product_image/${sanitizedFolderName}`;
      const uploadDir = join(process.cwd(), "public", relativeUploadDir);

      try {
        await stat(uploadDir);
      } catch (e: any) {
        if (e.code === "ENOENT") {
          await mkdir(uploadDir, { recursive: true });
        } else {
          console.error(
            "Error while trying to create directory when uploading a file\n",
            e
          );
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

    const newItem = await prisma.item.create({
      data: {
        name,
        type,
        quantity,
        unitprice,
        itemimage: fileUrl
          ? {
              create: {
                imagepath: fileUrl,
              },
            }
          : undefined,
      },
      include: {
        itemimage: true,
      },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
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
        name: true,
        type: true,
        quantity: true,
        unitprice: true,
        itemimage: {
          select: {
            imagepath: true,
          },
        },
      },
    });

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// export const PUT = async (req: NextRequest) => {
//   try {
//     const formData = await req.formData();

//     const itemId = parseInt(formData.get("itemid") as string, 10);
//     const name = formData.get("name") as string;
//     const typeString = formData.get("type") as string;
//     const quantity = parseInt(formData.get("quantity") as string, 10);
//     const unitprice = parseFloat(formData.get("unitprice") as string);
//     const image = formData.get("image") as File | null;

//     if (!Object.values(ItemType).includes(typeString as ItemType)) {
//       return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
//     }

//     const type = typeString as ItemType;

//     if (
//       !name ||
//       !type ||
//       isNaN(quantity) ||
//       isNaN(unitprice) ||
//       isNaN(itemId)
//     ) {
//       return NextResponse.json(
//         { error: "All fields are required and must be valid to be updated" },
//         { status: 400 }
//       );
//     }

//     const existingItem = await prisma.item.findUnique({
//       where: { itemid: itemId },
//       include: { itemimage: true },
//     });

//     if (!existingItem) {
//       return NextResponse.json({ error: "Item not found" }, { status: 404 });
//     }

//     let fileUrl = null;

//     if (image) {
//       if (image.size > MAX_FILE_SIZE) {
//         return NextResponse.json(
//           { error: "File is too large" },
//           { status: 400 }
//         );
//       }

//       if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
//         return NextResponse.json(
//           { error: "Invalid file type" },
//           { status: 400 }
//         );
//       }

//       const buffer = await image.arrayBuffer();
//       const relativeUploadDir = `/uploads/${new Date()
//         .toLocaleDateString("id-ID", {
//           day: "2-digit",
//           month: "2-digit",
//           year: "numeric",
//         })
//         .replace(/\//g, "-")}`;
//       const uploadDir = join(process.cwd(), "public", relativeUploadDir);

//       try {
//         await stat(uploadDir);
//       } catch (e: any) {
//         if (e.code === "ENOENT") {
//           await mkdir(uploadDir, { recursive: true });
//         } else {
//           console.error(
//             "Error while trying to create directory when uploading a file\n",
//             e
//           );
//           return NextResponse.json(
//             { error: "Internal server error" },
//             { status: 500 }
//           );
//         }
//       }

//       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//       const filename = `${image.name.replace(
//         /\s/g,
//         "-"
//       )}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
//       await writeFile(`${uploadDir}/${filename}`, Buffer.from(buffer));
//       fileUrl = `${relativeUploadDir}/${filename}`;

//       if (existingItem.itemimage.length > 0) {
//         const oldImagePath = join(
//           process.cwd(),
//           "public",
//           existingItem.itemimage[0].imagepath
//         );
//         try {
//           await unlink(oldImagePath);
//         } catch (e: any) {
//           console.error("Error deleting old image file\n", e);
//         }
//       }
//     }

//     const updatedItem = await prisma.item.update({
//       where: { itemid: itemId },
//       data: {
//         name,
//         type,
//         quantity,
//         unitprice,
//         itemimage: fileUrl
//           ? {
//               deleteMany: {}, // delete all existing images
//               create: {
//                 imagepath: fileUrl,
//               },
//             }
//           : undefined,
//       },
//       include: {
//         itemimage: true,
//       },
//     });

//     return NextResponse.json(updatedItem, { status: 200 });
//   } catch (error) {
//     console.error("Error updating item:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// };

export const PUT = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const itemId = parseInt(formData.get("itemid") as string, 10);
    const name = formData.get("name") as string;
    const typeString = formData.get("type") as string;
    const quantity = parseInt(formData.get("quantity") as string, 10);
    const unitprice = parseFloat(formData.get("unitprice") as string);
    const image = formData.get("image") as File | null;

    if (!Object.values(ItemType).includes(typeString as ItemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }

    const type = typeString as ItemType;

    if (!name || !type || isNaN(quantity) || isNaN(unitprice) || isNaN(itemId)) {
      return NextResponse.json(
        { error: "All fields are required and must be valid to be updated" },
        { status: 400 }
      );
    }

    const existingItem = await prisma.item.findUnique({
      where: { itemid: itemId },
      include: { itemimage: true },
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
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

      // Sanitize the name to create a valid folder name
      const sanitizedFolderName = name.replace(/[^a-zA-Z0-9-_]/g, "_");
      const relativeUploadDir = `/uploads/product_image/${sanitizedFolderName}`;
      const uploadDir = join(process.cwd(), "public", relativeUploadDir);

      try {
        await stat(uploadDir);
      } catch (e: any) {
        if (e.code === "ENOENT") {
          await mkdir(uploadDir, { recursive: true });
        } else {
          console.error(
            "Error while trying to create directory when uploading a file\n",
            e
          );
          return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          );
        }
      }

      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `${image.name.replace(/\s/g, "-")}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
      await writeFile(`${uploadDir}/${filename}`, Buffer.from(buffer));
      fileUrl = `${relativeUploadDir}/${filename}`;

      if (existingItem.itemimage.length > 0) {
        const oldImagePath = join(
          process.cwd(),
          "public",
          existingItem.itemimage[0].imagepath
        );
        try {
          await unlink(oldImagePath);
        } catch (e: any) {
          console.error("Error deleting old image file\n", e);
        }
      }
    }

    const updatedItem = await prisma.item.update({
      where: { itemid: itemId },
      data: {
        name,
        type,
        quantity,
        unitprice,
        itemimage: fileUrl
          ? {
              deleteMany: {}, // delete all existing images
              create: {
                imagepath: fileUrl,
              },
            }
          : undefined,
      },
      include: {
        itemimage: true,
      },
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

// export const DELETE = async (req: NextRequest) => {
//   try {
//     const body = await req.json();
//     const { itemid } = await z
//       .object({
//         itemid: z.number(),
//       })
//       .parseAsync(body);

//     let itemFound = await prisma.item.findFirst({
//       where: {
//         itemid,
//       },
//     });

//     if (!itemFound) {
//       return NextResponse.json({ error: "Item not found" }, { status: 404 });
//     } else {
//       // Delete the user
//       const deleteItem = await prisma.item.delete({
//         where: { itemid },
//       });

//       return NextResponse.json(deleteItem, { status: 200 });
//     }
//   } catch (error) {
//     console.error("Error deleting Item:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// };

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
      include: {
        itemimage: true,
      },
    });

    if (!itemFound) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (itemFound.itemimage.length > 0) {
      await prisma.itemImage.deleteMany({
        where: { itemid: itemFound.itemid },
      });
    }

    const deleteItem = await prisma.item.delete({
      where: { itemid },
    });

    if (itemFound.itemimage.length > 0) {
      const imagePath = join(
        process.cwd(),
        "public",
        itemFound.itemimage[0].imagepath
      );
      try {
        await unlink(imagePath);
      } catch (e: any) {
        console.error("Error deleting image file\n", e);
      }
    }

    return NextResponse.json(deleteItem, { status: 200 });
  } catch (error) {
    console.error("Error deleting Item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

