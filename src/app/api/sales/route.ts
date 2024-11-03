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
    ); // @ts-ignore
    const userid = session.user.userid;

    const formData = await req.formData();

    const invoicenumber = formData.get(
      "DocumentNumber[documentnumber]"
    ) as string;
    const frommilling = formData.get("frommilling") === "false";
    const statusString = formData.get("status") as string;
    const status = statusString as Status;
    const walkin = formData.get("walkin") === "true";

    if (!invoicenumber) {
      return NextResponse.json(
        { error: "Invoice number is required" },
        { status: 400 }
      );
    }

    if (!Object.values(Status).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const [newPurchase, newInvoice] = await prisma.$transaction(async (tx) => {
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

        const type = typeString as ItemType;
        const sackweight = sackweightString as SackWeight;

        let itemId;
        let itemUnitOfMeasurement;
        const existingItem = await tx.item.findFirst({
          where: { itemname: name, itemtype: type },
        });

        if (existingItem) {
          itemId = existingItem.itemid;
          itemUnitOfMeasurement = existingItem.unitofmeasurement;

          const currentStock = existingItem.stock ?? 0;

          if (currentStock === 0) {
            throw new Error("Transaction cannot proceed: stock is zero.");
          } else {
            const newStock = currentStock - stock;

            await tx.item.update({
              where: { itemid: itemId },
              data: {
                stock: newStock,
                lastmodifiedby: userid,
              },
            });
          }
        }

        const amount = stock * unitprice;
        if (isNaN(amount)) {
          throw new Error("Calculated amount is invalid");
        }

        totalAmount += amount;

        items.push({
          itemid: itemId,
          sackweight: sackweight,
          unitofmeasurement: itemUnitOfMeasurement,
          stock: stock,
          unitprice: unitprice,
          lastmodifiedby: userid,
          totalamount: amount,
        });

        index++;
      }

      const existingInvoice = await tx.documentNumber.findUnique({
        where: {
          documentnumber: invoicenumber,
        },
      });

      const newInvoice =
        existingInvoice ||
        (await tx.documentNumber.create({
          data: {
            documentnumber: invoicenumber,
          },
        }));

      const newPurchase = await tx.transaction.create({
        data: {
          createdby: userid,
          lastmodifiedby: userid,
          transactiontype: "sales",
          documentnumberid: newInvoice.documentnumberid,
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

        if (newPurchase.status === "paid") {
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
        } else if (
          newPurchase.status === "pending" ||
          newPurchase.status === "cancelled"
        ) {
          await tx.item.update({
            where: { itemid: originalStock.itemid },
            data: {
              stock: {
                increment: stockToUpdate,
              },
            },
          });
        }
      }

      return [newPurchase, newInvoice];
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
