import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { stat, mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import mime from "mime";
import _ from "lodash";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import { trace } from "console";

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

enum SackWeight {
  bag25kg = "bag25kg",
  cavan50kg = "cavan50kg",
}

enum UnitOfMeasurement {
  quantity = "quantity",
  weight = "weight",
}

// export const POST = async (req: NextRequest) => {
//   try {
//     const session = await getIronSession(
//       req,
//       NextResponse.next(),
//       sessionOptions
//     );
//     const userid = session.user.userid;

//     const formData = await req.formData();

//     const invoicenumber = formData.get("invoicenumber") as string;

//     const frommilling = formData.get("frommilling") === "true";
//     const firstname = formData.get("Entity[firstname]") as string;
//     const middlename = formData.get("Entity[middlename]") as string;
//     const lastname = formData.get("Entity[lastname]") as string;
//     const contactnumber = formData.get("Entity[contactnumber]") as string;
//     const statusString = formData.get("status") as string;
//     const status = statusString as Status;
//     const walkin = formData.get("walkin") === "true";
//     const taxpercentage =
//       parseFloat(formData.get("taxpercentage") as string) || 0; // Set default to 0 if NaN

//     // Validate Supplier Information
//     if (!firstname || !lastname || !contactnumber) {
//       return NextResponse.json(
//         { error: "Supplier name and contact number are required" },
//         { status: 400 }
//       );
//     }

//     // Ensure status is valid
//     if (!Object.values(Status).includes(status)) {
//       return NextResponse.json({ error: "Invalid status" }, { status: 400 });
//     }

//     // Normalize middlename if it is null
//     const normalizedMiddlename = middlename || "";

//     // Check or Create Supplier
//     const existingSupplier = await prisma.entity.findFirst({
//       where: {
//         type: "supplier",
//         firstname,
//         lastname,
//         contactnumber,
//       },
//     });

//     let supplierId;
//     if (existingSupplier) {
//       supplierId = existingSupplier.entityid;
//     } else {
//       const newSupplier = await prisma.entity.create({
//         data: {
//           type: "supplier",
//           firstname,
//           middlename: normalizedMiddlename,
//           lastname,
//           contactnumber,
//         },
//       });
//       supplierId = newSupplier.entityid;
//     }

//     // Initialize total amount for purchase
//     let totalAmount = 0;

//     // Process Items
//     const items: any[] = [];
//     let index = 0;

//     // Corrected loop to check formData keys properly
//     while (formData.has(`items[${index}][name]`)) {
//       const name = formData.get(`items[${index}][name]`) as string;
//       const typeString = formData.get(`items[${index}][type]`) as string;
//       const sackweightString = formData.get(
//         `items[${index}][sackweight]`
//       ) as string;
//       const unitpriceString = formData.get(
//         `items[${index}][unitprice]`
//       ) as string;
//       const unitofmeasurementstring = formData.get(
//         `items[${index}][unitofmeasurement]`
//       ) as string;
//       const unitprice = parseFloat(unitpriceString);
//       const unitofmeasurement = unitofmeasurementstring as UnitOfMeasurement;
//       const measurementvalueString = formData.get(
//         `items[${index}][measurementvalue]`
//       ) as string;
//       const measurementvalue = parseFloat(measurementvalueString);

//       console.log(`Processing item ${index}:`, {
//         name,
//         typeString,
//         unitprice,
//         unitofmeasurement,
//         measurementvalue,
//       });

//       // Validate Item Information
//       if (!name || !Object.values(ItemType).includes(typeString as ItemType)) {
//         return NextResponse.json(
//           { error: "Invalid item details" },
//           { status: 400 }
//         );
//       }

//       if (isNaN(unitprice) || isNaN(measurementvalue)) {
//         console.error("Invalid number fields", { unitprice, measurementvalue });
//         return NextResponse.json(
//           { error: "Number fields must be valid numbers" },
//           { status: 400 }
//         );
//       }

//       if (!unitofmeasurement) {
//         return NextResponse.json(
//           { error: "Unit of measurement is required" },
//           { status: 400 }
//         );
//       }

//       const type = typeString as ItemType;
//       const sackweight = sackweightString as SackWeight;

//       // Check or Create Item
//       let itemId;
//       const existingItem = await prisma.item.findFirst({
//         where: { name, type, unitofmeasurement },
//       });

//       if (existingItem) {
//         itemId = existingItem.itemid;

//         const currentStock = existingItem.stock ?? 0;
//         const newStock = currentStock + measurementvalue;

//         await prisma.item.update({
//           where: { itemid: itemId },
//           data: { stock: newStock },
//         });
//       } else {
//         const newItem = await prisma.item.create({
//           data: {
//             name,
//             type,
//             sackweight,
//             unitofmeasurement,
//             stock: measurementvalue,
//             lastmodifiedby: userid,
//           },
//         });
//         itemId = newItem.itemid;
//       }

//       // Calculate total amount for each purchase item
//       const amount = measurementvalue * unitprice;
//       if (isNaN(amount)) {
//         console.error("Calculated amount is NaN", {
//           measurementvalue,
//           unitprice,
//         });
//         return NextResponse.json(
//           { error: "Calculated amount is invalid" },
//           { status: 400 }
//         );
//       }

//       totalAmount += amount;
//       console.log(`Item ${index} processed. Current totalAmount:`, totalAmount);

//       items.push({
//         itemid: itemId,
//         unitofmeasurement,
//         measurementvalue,
//         unitprice,
//         lastmodifiedby: userid,
//         totalamount: amount,
//       });

//       index++;
//     }

//     const newInvoice = await prisma.invoicenumber.create({
//       data: {
//         invoicenumber,
//       },
//     });

//     // Create Purchase
//     const newPurchase = await prisma.transaction.create({
//       data: {
//         lastmodifiedby: userid,
//         type: "purchase",
//         entityid: supplierId,
//         invoicenumberid: newInvoice.invoicenumberid,
//         status,
//         walkin,
//         frommilling,
//         taxpercentage,
//         totalamount: totalAmount,
//       },
//     });

//     // Create Purchase Items
//     const purchaseItemsData = items.map((item) => ({
//       purchaseid: newPurchase.transactionid,
//       ...item,
//     }));

//     await prisma.transactionItem.createMany({
//       data: purchaseItemsData,
//     });

//     return NextResponse.json(
//       { message: "Purchase and items created successfully" },
//       { status: 201 }
//     );
//   } catch (error) {
//     console.error("Error creating purchase:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// };

export const POST = async (req: NextRequest) => {
  try {
    const session = await getIronSession(
      req,
      NextResponse.next(),
      sessionOptions
    );
    const userid = session.user.userid;

    const formData = await req.formData();

    const invoicenumber = formData.get("invoicenumber") as string;
    const frommilling = formData.get("frommilling") === "true";
    const firstname = formData.get("Entity[firstname]") as string;
    const middlename = formData.get("Entity[middlename]") as string;
    const lastname = formData.get("Entity[lastname]") as string;
    const contactnumber = formData.get("Entity[contactnumber]") as string;
    const statusString = formData.get("status") as string;
    const status = statusString as Status;
    const walkin = formData.get("walkin") === "true";
    const taxpercentage =
      parseFloat(formData.get("taxpercentage") as string) || 0; // Set default to 0 if NaN

    // Validate Supplier Information
    if (!firstname || !lastname || !contactnumber) {
      return NextResponse.json(
        { error: "Supplier name and contact number are required" },
        { status: 400 }
      );
    }

    // Ensure status is valid
    if (!Object.values(Status).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Normalize middlename if it is null
    const normalizedMiddlename = middlename || "";

    // Check or Create Supplier
    const existingSupplier = await prisma.entity.findFirst({
      where: {
        type: "supplier",
        firstname,
        lastname,
        contactnumber,
      },
    });

    let supplierId;
    if (existingSupplier) {
      supplierId = existingSupplier.entityid;
    } else {
      const newSupplier = await prisma.entity.create({
        data: {
          type: "supplier",
          firstname,
          middlename: normalizedMiddlename,
          lastname,
          contactnumber,
        },
      });
      supplierId = newSupplier.entityid;
    }

    // Initialize total amount for purchase
    let totalAmount = 0;

    // Process Items
    const items: any[] = [];
    let index = 0;

    // Corrected loop to check formData keys properly
    while (formData.has(`TransactionItem[${index}][item][name]`)) {
      const name = formData.get(`TransactionItem[${index}][item][name]`) as string;
      const typeString = formData.get(`TransactionItem[${index}][item][type]`) as string;
      const sackweightString = formData.get(`TransactionItem[${index}][item][sackweight]`) as string;
      const unitpriceString = formData.get(`TransactionItem[${index}][unitprice]`) as string;
      const unitofmeasurementstring = formData.get(`TransactionItem[${index}][unitofmeasurement]`) as string;
      const unitofmeasurement = unitofmeasurementstring as UnitOfMeasurement;
      const measurementvalueString = formData.get(`TransactionItem[${index}][measurementvalue]`) as string;
      const measurementvalue = parseFloat(measurementvalueString);
      const unitprice = parseFloat(unitpriceString);

      console.log(`Processing item ${index}:`, {
        name,
        typeString,
        unitprice,
        unitofmeasurement,
        measurementvalue,
      });

      // Validate Item Information
      if (!name || !Object.values(ItemType).includes(typeString as ItemType)) {
        return NextResponse.json(
          { error: "Invalid item details" },
          { status: 400 }
        );
      }

      if (isNaN(unitprice) || isNaN(measurementvalue)) {
        console.error("Invalid number fields", { unitprice, measurementvalue });
        return NextResponse.json(
          { error: "Number fields must be valid numbers" },
          { status: 400 }
        );
      }

      if (!unitofmeasurement) {
        return NextResponse.json(
          { error: "Unit of measurement is required" },
          { status: 400 }
        );
      }

      const type = typeString as ItemType;
      const sackweight = sackweightString as SackWeight;

      // Check or Create Item
      let itemId;
      const existingItem = await prisma.item.findFirst({
        where: { name, type, unitofmeasurement },
      });

      if (existingItem) {
        itemId = existingItem.itemid;

        const currentStock = existingItem.stock ?? 0;
        const newStock = currentStock + measurementvalue;

        await prisma.item.update({
          where: { itemid: itemId },
          data: { stock: newStock },
        });
      } else {
        const newItem = await prisma.item.create({
          data: {
            name,
            type,
            sackweight,
            unitofmeasurement,
            stock: measurementvalue,
            lastmodifiedby: userid,
          },
        });
        itemId = newItem.itemid;
      }

      // Calculate total amount for each purchase item
      const amount = measurementvalue * unitprice;
      if (isNaN(amount)) {
        console.error("Calculated amount is NaN", {
          measurementvalue,
          unitprice,
        });
        return NextResponse.json(
          { error: "Calculated amount is invalid" },
          { status: 400 }
        );
      }

      totalAmount += amount;
      console.log(`Item ${index} processed. Current totalAmount:`, totalAmount);

      items.push({
        itemid: itemId,
        unitofmeasurement: unitofmeasurement,
        measurementvalue: measurementvalue,
        unitprice: unitprice,
        lastmodifiedby: userid,
        totalamount: amount,
      });

      index++;
    }

    console.log("Final items array:", items);

    // Create Invoice
    const newInvoice = await prisma.invoicenumber.create({
      data: {
        invoicenumber,
      },
    });

    // Create Purchase
    const newPurchase = await prisma.transaction.create({
      data: {
        lastmodifiedby: userid,
        type: "purchase",
        entityid: supplierId,
        invoicenumberid: newInvoice.invoicenumberid,
        status,
        walkin,
        frommilling,
        taxpercentage,
        totalamount: totalAmount, // Set initial total amount to 0
      },
    });

    // Use the transactionid obtained from the newly created purchase
    const transactionId = newPurchase.transactionid;

    // Add transactionid to each item
    const purchaseItemsData = items.map(item => ({
      ...item,
      transactionid: transactionId, 
    }));

    // Create Purchase Items
    if (purchaseItemsData.length > 0) {
      try {
        await prisma.transactionItem.createMany({
          data: purchaseItemsData,
        });
      } catch (error) {
        console.error("Error creating transaction items:", error);
        return NextResponse.json(
          { error: "Error creating transaction items" },
          { status: 500 }
        );
      }
    } else {
      console.warn("No items to create");
    }

    // Update total amount of the purchase transaction
    await prisma.transaction.update({
      where: { transactionid: transactionId },
      data: { totalamount: totalAmount },
    });

    return NextResponse.json(
      { message: "Purchase and items created successfully" },
      { status: 201 }
    );
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
    const transaction = await prisma.transaction.findMany({
      where: {
        type: "purchase",
        deleted: false,
      },
      include: {
        Entity: {
          select: {
            firstname: true,
            middlename: true,
            lastname: true,
            contactnumber: true,
          },
        },
        User: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
        Invoicenumber: {
          select: {
            invoicenumber: true,
          },
        },
        TransactionItem: {
          select: {
            Item: {
              select: {
                name: true,
                type: true,
                sackweight: true,
              },
            },
            unitofmeasurement: true,
            measurementvalue: true,
            unitprice: true,
            totalamount: true,
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

    return NextResponse.json(convertedTransaction, { status: 200 });
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
    );
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
      return NextResponse.json(
        { error: "Unit of measurement is required" },
        { status: 400 }
      );
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
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    const existingPurchaseItem = await prisma.purchaseItem.findFirst({
      where: { purchaseid },
    });

    if (!existingPurchaseItem) {
      return NextResponse.json(
        { error: "Purchase item not found" },
        { status: 404 }
      );
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
      where: {
        purchaseid,
        purchaseitemid: existingPurchaseItem.purchaseitemid,
      },
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
