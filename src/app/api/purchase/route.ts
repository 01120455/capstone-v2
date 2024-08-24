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

enum ItemType {
  bigas = "bigas",
  palay = "palay",
  resico = "resico",
}

enum Status {
  pending = "pending",
  paid = "paid",
  cancelled = "cancelled",
}

export const POST = async (req: NextRequest) => {
  try {
    const session = await getIronSession(req, NextResponse.next(), sessionOptions);

    const userid = session.user.userid;

    const formData = await req.formData();

    const name = formData.get("name") as string;
    console.log("Name:", name);

    const typeString = formData.get("type") as string;
    console.log("Type:", typeString);

    if (!Object.values(ItemType).includes(typeString as ItemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }
    const type = typeString as ItemType;

    const noofsack = parseInt(formData.get("noofsack") as string, 10);
    console.log("No of Sack:", noofsack);

    const priceperunit = parseFloat(formData.get("priceperunit") as string);
    console.log("Price per unit:", priceperunit);

    if (isNaN(noofsack) || isNaN(priceperunit)) {
      return NextResponse.json(
        {
          error:
            "Number of sack and unit price must be valid numbers and not negative values",
        },
        { status: 400 }
      );
    }

    const totalweight = parseFloat(formData.get("totalweight") as string);
    console.log("Total weight:", totalweight);

    const unitofmeasurement = formData.get("unitofmeasurement") as string;
    console.log("Unit of Measurement:", unitofmeasurement);

    if (!unitofmeasurement) {
      return NextResponse.json(
        { error: "Unit of measurement is required" },
        { status: 400 }
      );
    }

    if (!name || !type || isNaN(noofsack) || isNaN(totalweight)) {
      return NextResponse.json(
        { error: "All fields are required and must be valid to be added" },
        { status: 400 }
      );
    }

    const suppliername = formData.get("suppliername") as string;
    console.log("Supplier name:", suppliername);

    const contactnumber = BigInt(formData.get("contactnumber") as string);
    console.log("Contact number:", contactnumber);

    if (!suppliername || !contactnumber) {
      return NextResponse.json(
        { error: "Supplier name and contact number are required" },
        { status: 400 }
      );
    }

    const statusString = formData.get("status") as string;
    console.log("Status:", statusString);
    const status = statusString as Status;
    const totalamount = totalweight * priceperunit;
    console.log("Total amount:", totalamount);

    if (!Object.values(Status).includes(statusString as Status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const existingSupplier = await prisma.supplier.findUnique({
      where: {
        suppliername_contactnumber: {
          suppliername,
          contactnumber,
        },
      },
    });

    let supplierId;
    if (existingSupplier) {
      supplierId = existingSupplier.supplierid;
    } else {
      const newSupplier = await prisma.supplier.create({
        data: {
          suppliername,
          contactnumber,
        },
      });
      supplierId = newSupplier.supplierid;
    }

        
        const existingItem = await prisma.item.findFirst({
          where: { name, type, unitofmeasurement },
        });
    
        let itemId;
        if (existingItem) {
          itemId = existingItem.itemid;
          
          const currentStock = existingItem.stock ?? 0;
          const newStock = currentStock + noofsack;
    
          
          await prisma.item.update({
            where: { itemid: itemId },
            data: { stock: newStock },
          });
        } else {
          
          const newItem = await prisma.item.create({
            data: { name, type, unitofmeasurement, stock: noofsack },
          });
          itemId = newItem.itemid;
        }


    const newPurchase = await prisma.purchase.create({
      data: {
        userid,
        supplierid: supplierId,
        status,
        totalamount,
      },
    });

    const newPurchaseItem = await prisma.purchaseItem.create({
      data: {
        purchaseid: newPurchase.purchaseid,
        itemid: itemId,
        noofsack,
        unitofmeasurement,
        totalweight,
        priceperunit,
      },
    });

    return NextResponse.json(newPurchaseItem, { status: 201 });
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export async function GET(req: NextRequest) {
  try {
    // Fetch the data from the database
    const purchases = await prisma.purchase.findMany({
      select: {
        PurchaseItems: {
          select: {
            Item: {
              select: {
                name: true,
                type: true,
                unitofmeasurement: true,
              },
            },
            noofsack: true,
            priceperunit: true,
            totalweight: true,
          },
        },
        Supplier: {
          select: {
            suppliername: true,
            contactnumber: true,
          },
        },
        User: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
        LastModifier: { 
          select: {
            firstname: true,
            lastname: true,
          },
        },
        purchaseid: true,
        frommilling: true,
        status: true,
        totalamount: true,
        date: true,
        updatedat: true,
      },
    });

    // Convert BigInt values to strings
// Function to convert BigInt values to strings
const convertBigIntToString = (value: any): any => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(convertBigIntToString);
  }
  if (value !== null && typeof value === 'object') {
    const shouldSkipConversion = ['date', 'updatedat'];
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        shouldSkipConversion.includes(key) ? val : convertBigIntToString(val)])
    );
  }
  return value;
};

// Sanitize the purchases data
const sanitizedPurchases = convertBigIntToString(purchases);

console.log("Sanitized purchases:", sanitizedPurchases);

    return NextResponse.json(sanitizedPurchases, { status: 200 });
  } catch (error) {
    console.error("Error fetching purchases:", error);
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
    const session = await getIronSession(req, NextResponse.next(), sessionOptions);
    const userid = session.user.userid;
    const formData = await req.formData();

    const purchaseid = parseInt(formData.get("purchaseid") as string, 10);

    const name = formData.get("name") as string;
    const typeString = formData.get("type") as string;
    const noofsack = parseInt(formData.get("noofsack") as string, 10);
    const priceperunit = parseFloat(formData.get("priceperunit") as string);
    const totalweight = parseFloat(formData.get("totalweight") as string);
    const unitofmeasurement = formData.get("unitofmeasurement") as string;
    const suppliername = formData.get("suppliername") as string;
    const contactnumber = BigInt(formData.get("contactnumber") as string);
    const statusString = formData.get("status") as string;

    if (!Object.values(ItemType).includes(typeString as ItemType)) {
      return NextResponse.json({ error: "Invalid item type" }, { status: 400 });
    }
    const type = typeString as ItemType;

    if (isNaN(noofsack) || isNaN(priceperunit) || isNaN(totalweight)) {
      return NextResponse.json(
        { error: "Number fields must be valid numbers" },
        { status: 400 }
      );
    }

    if (!unitofmeasurement) {
      return NextResponse.json({ error: "Unit of measurement is required" }, { status: 400 });
    }

    if (!name || !type || isNaN(noofsack) || isNaN(totalweight)) {
      return NextResponse.json(
        { error: "All fields are required and must be valid" },
        { status: 400 }
      );
    }

    if (!suppliername || !contactnumber) {
      return NextResponse.json(
        { error: "Supplier name and contact number are required" },
        { status: 400 }
      );
    }

    if (!Object.values(Status).includes(statusString as Status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    const status = statusString as Status;

    const totalamount = totalweight * priceperunit;

    // Find existing purchase and item
    const existingPurchase = await prisma.purchase.findUnique({
      where: { purchaseid },
    });

    if (!existingPurchase) {
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    const existingPurchaseItem = await prisma.purchaseItem.findFirst({
      where: { purchaseid },
    });

    if (!existingPurchaseItem) {
      return NextResponse.json({ error: "Purchase item not found" }, { status: 404 });
    }

    // Find or create supplier
    let supplierId;
    const existingSupplier = await prisma.supplier.findUnique({
      where: { suppliername_contactnumber: { suppliername, contactnumber } },
    });

    if (existingSupplier) {
      supplierId = existingSupplier.supplierid;
    } else {
      const newSupplier = await prisma.supplier.create({
        data: { suppliername, contactnumber },
      });
      supplierId = newSupplier.supplierid;
    }

    // Find or create item
    const existingItem = await prisma.item.findFirst({
      where: { name, type, unitofmeasurement },
    });

    let itemId = existingPurchaseItem.itemid;
    if (existingItem) {
      itemId = existingItem.itemid;

      const currentStock = existingItem.stock ?? 0;
      const pastNoOfSack = existingPurchaseItem.noofsack ?? 0;
      const editedNoOfSack = noofsack - pastNoOfSack;
      const newStock = currentStock + editedNoOfSack;

      await prisma.item.update({
        where: { itemid: itemId },
        data: { stock: newStock },
      });
    } else {
      const newItem = await prisma.item.create({
        data: { name, type, unitofmeasurement, stock: noofsack },
      });
      itemId = newItem.itemid;
    }

    // Update purchase and purchase item
    const updatedPurchase = await prisma.purchase.update({
      where: { purchaseid },
      data: {
        updatedby: userid,
        supplierid: supplierId,
        status,
        totalamount,
      },
    });

    const updatedPurchaseItem = await prisma.purchaseItem.update({
      where: { purchaseid, purchaseitemid: existingPurchaseItem.purchaseitemid },
      data: {
        itemid: itemId,
        noofsack,
        unitofmeasurement,
        totalweight,
        priceperunit,
      },
    });

    return NextResponse.json(updatedPurchaseItem, { status: 200 });
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
