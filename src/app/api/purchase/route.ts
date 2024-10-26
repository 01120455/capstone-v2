import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
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
    ); //@ts-ignore
    const userid = session.user.userid;

    const formData = await req.formData();

    const invoicenumber = formData.get("documentnumber") as string;
    const frommilling = formData.get("frommilling") === "true";
    const statusString = formData.get("status") as string;
    const status = statusString as Status;
    const walkin = formData.get("walkin") === "true";

    if (!Object.values(Status).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [newPurchase, newPurchaseOrderNo] = await prisma.$transaction(
      async (tx) => {
        let totalAmount = 0;

        const items: any[] = [];
        let index = 0;

        while (formData.has(`TransactionItem[${index}][item][name]`)) {
          const name = formData.get(
            `TransactionItem[${index}][item][name]`
          ) as string;
          const typeString = formData.get(
            `TransactionItem[${index}][item][type]`
          ) as string;
          const sackweightString = formData.get(
            `TransactionItem[${index}][item][sackweight]`
          ) as string;
          const unitpriceString = formData.get(
            `TransactionItem[${index}][unitprice]`
          ) as string;
          const unitofmeasurementstring = formData.get(
            `TransactionItem[${index}][unitofmeasurement]`
          ) as string;
          const unitofmeasurement =
            unitofmeasurementstring as UnitOfMeasurement;
          const stockString = formData.get(
            `TransactionItem[${index}][stock]`
          ) as string;
          const stock = parseFloat(stockString);
          const unitprice = parseFloat(unitpriceString);

          if (
            !name ||
            !Object.values(ItemType).includes(typeString as ItemType)
          ) {
            throw new Error("Invalid item details");
          }

          if (isNaN(unitprice) || isNaN(stock)) {
            throw new Error("Number fields must be valid numbers");
          }

          if (!unitofmeasurement) {
            throw new Error("Unit of measurement is required");
          }

          const type = typeString as ItemType;
          const sackweight = sackweightString as SackWeight;

          let itemId;
          const existingItem = await tx.item.findFirst({
            where: { name, type, unitofmeasurement },
          });

          if (existingItem) {
            itemId = existingItem.itemid;

            const currentStock = existingItem.stock ?? 0;
            const newStock = currentStock + stock;

            await tx.item.update({
              where: { itemid: itemId },
              data: { stock: newStock },
            });
          } else {
            const newItem = await tx.item.create({
              data: {
                name,
                type,
                sackweight,
                unitofmeasurement,
                stock: stock,
                lastmodifiedby: userid,
              },
            });
            itemId = newItem.itemid;
          }

          const amount = stock * unitprice;
          if (isNaN(amount)) {
            throw new Error("Calculated amount is invalid");
          }

          totalAmount += amount;

          items.push({
            itemid: itemId,
            type: type,
            sackweight: sackweight,
            unitofmeasurement: unitofmeasurement,
            stock: stock,
            unitprice: unitprice,
            lastmodifiedby: userid,
            totalamount: amount,
          });

          index++;
        }

        const existingPurchaseOrderNo = await tx.documentNumber.findUnique({
          where: {
            documentnumber: invoicenumber,
          },
        });

        const newPurchaseOrderNo =
          existingPurchaseOrderNo ||
          (await tx.documentNumber.create({
            data: {
              documentnumber: invoicenumber,
            },
          }));

        const newPurchase = await tx.transaction.create({
          data: {
            lastmodifiedby: userid,
            type: "purchase",
            documentnumberid: newPurchaseOrderNo.documentnumberid,
            status,
            walkin,
            frommilling,
            totalamount: totalAmount,
          },
        });

        const purchaseItemsData = items.map((item) => ({
          ...item,
          transactionid: newPurchase.transactionid,
        }));

        if (purchaseItemsData.length > 0) {
          await tx.transactionItem.createMany({
            data: purchaseItemsData,
          });
        }

        return [newPurchase, newPurchaseOrderNo];
      }
    );

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
        recentdelete: false,
      },
      include: {
        User: {
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
          where: {
            recentdelete: false,
          },
          select: {
            transactionid: true,
            Item: {
              select: {
                name: true,
                type: true,
                sackweight: true,
              },
            },
            transactionitemid: true,
            type: true,
            sackweight: true,
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
          lastmodifiedat: "desc",
        },
        {
          createdat: "asc",
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

// export const PUT = async (req: NextRequest) => {
//   try {
//     const session = await getIronSession(
//       req,
//       NextResponse.next(),
//       sessionOptions
//     );
//     const userid = session.user.userid;

//     const { pathname } = new URL(req.url);
//     const transactionId = parseInt(pathname.split("/").pop() as string, 10);

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

//       if (isNaN(transactionId)) {
//         return NextResponse.json(
//           { error: "Invalid transaction ID" },
//           { status: 400 }
//         );
//       }

//     // Validate Supplier Information
//     if (!firstname || !lastname || !contactnumber) {
//       return NextResponse.json(
//         { error: "Supplier name and contact number are required" },
//         { status: 400 }
//       );
//     }

//     if (!invoicenumber) {
//       return NextResponse.json(
//         { error: "Invoice number is required" },
//         { status: 400 }
//       );
//     }

//     // Ensure status is valid
//     if (!Object.values(Status).includes(status)) {
//       return NextResponse.json({ error: "Invalid status" }, { status: 400 });
//     }

//     // Normalize middlename if it is null
//     const normalizedMiddlename = middlename || "";

//     // Find existing purchase and item
//     const existingPurchase = await prisma.transaction.findUnique({
//       where: { transactionid: transactionId },
//     });

//     if (!existingPurchase) {
//       return NextResponse.json(
//         { error: "Purchase not found" },
//         { status: 404 }
//       );
//     }

//     // Find or create supplier
//     let supplierId;
//     const existingSupplier = await prisma.entity.findUnique({
//       where: { entityid: existingPurchase.entityid },
//     });

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

//     // Update purchase and purchase item
//     const updatedPurchase = await prisma.transaction.update({
//       where: { transactionid: transactionId },
//       data: {
//         lastmodifiedby: userid,
//         entityid: supplierId,
//         status,
//         walkin,
//         frommilling,
//         taxpercentage,
//       },
//     });

//     return NextResponse.json(updatedPurchase, { status: 200 });
//   } catch (error) {
//     console.error("Error updating item:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// };

// export const PUT = async (req: NextRequest) => {
//   try {
//     const session = await getIronSession(
//       req,
//       NextResponse.next(),
//       sessionOptions
//     );
//     const userid = session.user.userid;
//     const formData = await req.formData();

//     const transactionid = parseInt(formData.get("transactionid") as string, 10);
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

//     if (isNaN(transactionid)) {
//       return NextResponse.json(
//         { error: "Invalid transaction ID" },
//         { status: 400 }
//       );
//     }

//     // Validate Supplier Information
//     if (!firstname || !lastname || !contactnumber) {
//       return NextResponse.json(
//         { error: "Supplier name and contact number are required" },
//         { status: 400 }
//       );
//     }

//     if (!invoicenumber) {
//       return NextResponse.json(
//         { error: "Invoice number is required" },
//         { status: 400 }
//       );
//     }

//     // Ensure status is valid
//     if (!Object.values(Status).includes(status)) {
//       return NextResponse.json({ error: "Invalid status" }, { status: 400 });
//     }

//     // Normalize middlename if it is null
//     const normalizedMiddlename = middlename || "";

//     // Find existing purchase and item
//     const existingPurchase = await prisma.transaction.findUnique({
//       where: { transactionid: transactionid },
//     });

//     if (!existingPurchase) {
//       return NextResponse.json(
//         { error: "Purchase not found" },
//         { status: 404 }
//       );
//     }

//     // Find or create supplier
//     let supplierId;
//     const existingSupplier = await prisma.entity.findUnique({
//       where: { entityid: existingPurchase.entityid },
//     });

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

//     // Update purchase and purchase item
//     const updatedPurchase = await prisma.transaction.update({
//       where: { transactionid: transactionid },
//       data: {
//         lastmodifiedby: userid,
//         entityid: supplierId,
//         status,
//         walkin,
//         frommilling,
//         taxpercentage,
//       },
//     });

//     return NextResponse.json(updatedPurchase, { status: 200 });
//   } catch (error) {
//     console.error("Error updating item:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// };

// export async function PUT(req: NextRequest) {
//   return handleRequest(req);
// }

// // Common function to handle both POST and PUT requests
// async function handleRequest(req: NextRequest) {
//   try {
//     const { pathname } = new URL(req.url);
//     const transactionId = parseInt(pathname.split("/").pop() as string, 10);

//     console.log("Extracted transactionId:", transactionId);
//     z;
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
//       parseFloat(formData.get("taxpercentage") as string) || 0;

//     // If transactionId is invalid, return an error response
//     if (isNaN(transactionId) && req.method === "PUT") {
//       return NextResponse.json(
//         { error: "Invalid transaction ID" },
//         { status: 400 }
//       );
//     }

//     // Validate Supplier Information
//     if (!firstname || !lastname || !contactnumber) {
//       return NextResponse.json(
//         { error: "Supplier name and contact number are required" },
//         { status: 400 }
//       );
//     }

//     if (!invoicenumber) {
//       return NextResponse.json(
//         { error: "Invoice number is required" },
//         { status: 400 }
//       );
//     }

//     // Ensure status is valid
//     if (!Object.values(Status).includes(status)) {
//       return NextResponse.json({ error: "Invalid status" }, { status: 400 });
//     }

//     // Normalize middlename if it is null
//     const normalizedMiddlename = middlename || "";

//     let supplierId;

//     console.log("Looking for transaction with ID:", transactionId);
//     // If transactionId exists, update the transaction
//     if (transactionId) {
//       const existingPurchase = await prisma.transaction.findUnique({
//         where: { transactionid: transactionId },
//       });

//       console.log("Found purchase:", existingPurchase);

//       if (!existingPurchase) {
//         return NextResponse.json(
//           { error: "Purchase not found" },
//           { status: 404 }
//         );
//       }

//       // Find or create supplier

//       const existingSupplier = await prisma.entity.findUnique({
//         where: { entityid: existingPurchase.entityid },
//       });

//       if (existingSupplier) {
//         supplierId = existingSupplier.entityid;
//       } else {
//         const newSupplier = await prisma.entity.create({
//           data: {
//             type: "supplier",
//             firstname,
//             middlename: normalizedMiddlename,
//             lastname,
//             contactnumber,
//           },
//         });
//         supplierId = newSupplier.entityid;
//       }

//       // Update purchase and purchase item
//       const updatedPurchase = await prisma.transaction.update({
//         where: { transactionid: transactionId },
//         data: {
//           lastmodifiedby: userid,
//           entityid: supplierId,
//           status,
//           walkin,
//           frommilling,
//           taxpercentage,
//         },
//       });

//       return NextResponse.json(updatedPurchase, { status: 200 });
//     } else {
//       // If transactionId does not exist, create a new transaction

//       const newPurchase = await prisma.transaction.create({
//         data: {
//           type: "purchase",
//           status,
//           walkin,
//           frommilling,
//           taxpercentage,
//           entityid: supplierId,
//           lastmodifiedby: userid,
//           Entity: {
//             // Include the required 'Entity' object
//             connect: {
//               entityid: supplierId,
//             },
//           },
//         },
//       });

//       return NextResponse.json(newPurchase, { status: 201 });
//     }
//   } catch (error) {
//     console.error("Error processing request:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
