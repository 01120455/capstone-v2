import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

enum Status {
  pending = "pending",
  paid = "paid",
  cancelled = "cancelled",
}
export const PUT = async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const transactionId = parseInt(pathname.split("/").pop() as string, 10);

    const session = await getIronSession(
      req,
      NextResponse.next(),
      sessionOptions
    ); // @ts-ignore
    const userid = session.user.userid;
    const formData = await req.formData();

    const invoicenumber = formData.get("documentnumber") as string;
    const frommilling = formData.get("frommilling") === "true";
    const statusString = formData.get("status") as string;
    const status = statusString as Status;
    const walkin = formData.get("walkin") === "true";

    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    if (!invoicenumber) {
      return NextResponse.json(
        { error: "Invoice number is required" },
        { status: 400 }
      );
    }

    if (!Object.values(Status).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedPurchase = await prisma.$transaction(async (tx) => {
      const existingPurchase = await tx.transaction.findUnique({
        where: { transactionid: transactionId },
        select: {
          transactionid: true,
          totalamount: true,
          documentnumberid: true,
          TransactionItem: {
            select: {
              itemid: true,
              stock: true,
            },
          },
        },
      });

      if (!existingPurchase) {
        throw new Error("Purchase not found");
      }

      const totalAmount = existingPurchase.totalamount ?? 0;

      let invoiceNumberId;
      const existingInvoiceNumber = await tx.documentNumber.findFirst({
        where: { documentnumber: invoicenumber },
      });

      if (existingInvoiceNumber) {
        invoiceNumberId = existingInvoiceNumber.documentnumberid;
      } else {
        const newInvoiceNumber = await tx.documentNumber.update({
          where: { documentnumberid: existingPurchase.documentnumberid || 0 },
          data: {
            documentnumber: invoicenumber,
          },
        });
        invoiceNumberId = newInvoiceNumber.documentnumberid;
      }

      const updatedPurchase = await tx.transaction.update({
        where: { transactionid: transactionId },
        data: {
          lastmodifiedby: userid,
          documentnumberid: invoiceNumberId,
          status: status,
          walkin: walkin,
          frommilling: frommilling,
        },
      });

      const originalStocks = existingPurchase.TransactionItem.map((item) => ({
        itemid: item.itemid,
        stock: item.stock, 
      }));
      
      for (const originalStock of originalStocks) {
        const stockToUpdate = originalStock.stock;
      
        const currentItem = await tx.item.findUnique({
          where: { itemid: originalStock.itemid },
        });
      
        if (!currentItem) continue; 
      
        if (status === "cancelled" || status === "pending") {
   
          if (currentItem.stock >= stockToUpdate) {
            await tx.item.update({
              where: { itemid: originalStock.itemid },
              data: {
                stock: {
                  decrement: stockToUpdate,
                },
              },
            });
          } else {

            await tx.item.update({
              where: { itemid: originalStock.itemid },
              data: { stock: 0 },
            });
          }
        } else if (status === "paid") {

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
      
      return updatedPurchase;
    });

    return NextResponse.json(updatedPurchase, { status: 200 });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
