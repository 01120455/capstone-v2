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

        while (formData.has(`TransactionItem[${index}][item][itemname]`)) {
          const name = formData.get(
            `TransactionItem[${index}][item][itemname]`
          ) as string;
          const typeString = formData.get(
            `TransactionItem[${index}][item][itemtype]`
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
            where: {
              itemname: name,
              itemtype: type,
              status: "active",
              unitofmeasurement,
            },
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
                itemname: name,
                itemtype: type,
                sackweight,
                status: "active",
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
            createdby: userid,
            transactiontype: "purchase",
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

        const originalStocks = items.map((item) => ({
          itemid: item.itemid,
          stock: item.stock,
        }));

        for (const originalStock of originalStocks) {
          const stockToUpdate = originalStock.stock;

          const currentItem = await tx.item.findUnique({
            where: { itemid: originalStock.itemid },
          });

          if (!currentItem) continue;

          if (
            newPurchase.status === "pending" ||
            newPurchase.status === "cancelled"
          ) {
            if (currentItem.stock > 0) {
              const newStock = currentItem.stock - stockToUpdate;

              if (newStock < 0) {
                await tx.item.update({
                  where: { itemid: originalStock.itemid },
                  data: { stock: 0 },
                });
              } else {
                await tx.item.update({
                  where: { itemid: originalStock.itemid },
                  data: {
                    stock: newStock,
                  },
                });
              }
            }
          } 
          // else if (newPurchase.status === "paid") {
          //   await tx.item.update({
          //     where: { itemid: originalStock.itemid },
          //     data: {
          //       stock: {
          //         increment: stockToUpdate,
          //       },
          //     },
          //   });
          // }
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
        transactiontype: "purchase",
      },
      include: {
        lastmodifiedbyuser: {
          select: {
            firstname: true,
            lastname: true,
          },
        },
        createdbyuser: {
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
          select: {
            transactionid: true,
            Item: {
              select: {
                itemname: true,
                itemtype: true,
                sackweight: true,
              },
            },
            transactionitemid: true,
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
