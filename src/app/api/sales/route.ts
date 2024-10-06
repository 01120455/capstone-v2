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
    );
    const userid = session.user.userid;

    const formData = await req.formData();

    const invoicenumber = formData.get(
      "InvoiceNumber[invoicenumber]"
    ) as string;
    const frommilling = formData.get("frommilling") === "true";
    const name = formData.get("Entity[name]") as string;
    const contactnumber = formData.get("Entity[contactnumber]") as string;
    const statusString = formData.get("status") as string;
    const status = statusString as Status;
    const walkin = formData.get("walkin") === "true";
    const taxpercentage =
      parseFloat(formData.get("taxpercentage") as string) || 0;

    if (!invoicenumber) {
      return NextResponse.json(
        { error: "Invoice number is required" },
        { status: 400 }
      );
    }

    // Validate Supplier Information
    if (!name) {
      return NextResponse.json(
        { error: "Entity name are required" },
        { status: 400 }
      );
    }

    // Ensure status is valid
    if (!Object.values(Status).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const contactNumberIfNull = contactnumber || "";

    const [newPurchase, newInvoice] = await prisma.$transaction(async (tx) => {
      // Check or Create Entity with the appropriate role
      let entityId;
      const existingEntity = await tx.entity.findFirst({
        where: {
          name,
        },
        include: {
          roles: true, // Assuming you have a relation with roles
        },
      });

      if (existingEntity) {
        entityId = existingEntity.entityid;
        // Check if the entity has the correct role
        const hasRole = existingEntity.roles.some((r) => r.role === "customer");

        if (!hasRole) {
          // Add the role if it doesn't exist
          await tx.entityRole.create({
            data: {
              entityid: entityId,
              role: "customer", // Add the new role
            },
          });
        }
      } else {
        const newEntity = await tx.entity.create({
          data: {
            name,
            contactnumber: contactNumberIfNull,
            roles: {
              create: [
                {
                  role: "customer",
                },
              ], // Create the role along with the entity
            },
          },
        });
        entityId = newEntity.entityid;
      }

      // Initialize total amount for purchase
      let totalAmount = 0;

      // Process Items
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
        const measurementvalueString = formData.get(
          `TransactionItem[${index}][measurementvalue]`
        ) as string;
        const measurementvalue = parseFloat(measurementvalueString);
        const unitprice = parseFloat(unitpriceString);

        // Validate Item Information
        if (
          !name ||
          !Object.values(ItemType).includes(typeString as ItemType)
        ) {
          throw new Error("Invalid item details");
        }

        if (isNaN(unitprice) || isNaN(measurementvalue)) {
          throw new Error("Number fields must be valid numbers");
        }

        const type = typeString as ItemType;
        const sackweight = sackweightString as SackWeight;

        // Check or Create Item
        let itemId;
        let itemUnitOfMeasurement;
        const existingItem = await tx.item.findFirst({
          where: { name, type },
        });

        if (existingItem) {
          itemId = existingItem.itemid;
          itemUnitOfMeasurement = existingItem.unitofmeasurement;

          const currentStock = existingItem.stock ?? 0;

          if (currentStock === 0) {
            // Throw an error if stock is 0
            throw new Error("Transaction cannot proceed: stock is zero.");
          } else {
            const newStock = currentStock - measurementvalue;

            await tx.item.update({
              where: { itemid: itemId },
              data: {
                stock: newStock,
                lastmodifiedby: userid,
              },
            });
          }
        }

        // Calculate total amount for each purchase item
        const amount = measurementvalue * unitprice;
        if (isNaN(amount)) {
          throw new Error("Calculated amount is invalid");
        }

        totalAmount += amount;

        items.push({
          itemid: itemId,
          unitofmeasurement: itemUnitOfMeasurement,
          measurementvalue: measurementvalue,
          unitprice: unitprice,
          lastmodifiedby: userid,
          totalamount: amount,
        });

        index++;
      }

      // Create Invoice
      const newInvoice = await tx.invoiceNumber.create({
        data: {
          invoicenumber,
        },
      });

      const taxAmount = totalAmount * (taxpercentage / 100);
      const totalAmountAfterTax = totalAmount - taxAmount;

      // Create Purchase
      const newPurchase = await tx.transaction.create({
        data: {
          lastmodifiedby: userid,
          type: "sales",
          entityid: entityId,
          invoicenumberid: newInvoice.invoicenumberid,
          status,
          walkin,
          frommilling,
          taxpercentage,
          taxamount: taxAmount,
        },
      });

      // Add transactionid to each item
      const purchaseItemsData = items.map((item) => ({
        ...item,
        transactionid: newPurchase.transactionid,
      }));

      // Create Purchase Items
      if (purchaseItemsData.length > 0) {
        await tx.transactionItem.createMany({
          data: purchaseItemsData,
        });
      }

      // Update total amount of the purchase transaction
      await tx.transaction.update({
        where: { transactionid: newPurchase.transactionid },
        data: { totalamount: totalAmountAfterTax },
      });

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
