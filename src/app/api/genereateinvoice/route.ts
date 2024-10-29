import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { pathname } = new URL(req.url);
  const transactionId = parseInt(pathname.split("/").pop() as string, 10);

  if (isNaN(transactionId)) {
    return NextResponse.json(
      { error: "Invalid transactionId" },
      { status: 400 }
    );
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: {
        transactionid: transactionId,
      },
      include: {
        TransactionItem: {
          include: {
            Item: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { height } = page.getSize();
    const fontSize = 12;
    const margin = 50;

    // Add transaction details
    page.drawText(`Document Number: ${transaction.transactionid}`, {
      x: margin,
      y: height - margin,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Date: ${transaction.createdat.toISOString().split("T")[0]}`, {
      x: margin,
      y: height - margin - 20,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Status: ${transaction.status}`, {
      x: margin,
      y: height - margin - 40,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(`Created by: ${transaction.}`, {
      x: margin,
      y: height - margin - 60,
      size: fontSize,
      color: rgb(0, 0, 0),
    });

    // Add a space before the table
    let tableY = height - margin - 100;

    // Draw table header
    const headers = [
      "Item Name",
      "Item Type",
      "Sack Weight",
      "Unit of Measurement",
      "Stock",
      "Unit Price",
      "Total Amount",
    ];
    const headerY = tableY;

    headers.forEach((header, index) => {
      page.drawText(header, {
        x: margin + index * 80,
        y: headerY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    });

    // Draw table rows
    transaction.TransactionItem.forEach((item, index) => {
      const itemY = headerY - (index + 1) * 20;
      page.drawText(item.Item?.name, {
        x: margin,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.Item.type, {
        x: margin + 80,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.sackweight.toString(), {
        x: margin + 160,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.unitofmeasurement, {
        x: margin + 240,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.stock.toString(), {
        x: margin + 320,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.unitprice.toFixed(2), {
        x: margin + 400,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText((item.stock * item.unitprice).toFixed(2), {
        x: margin + 480,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();
    return NextResponse.buffer(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=transaction-${transactionId}.pdf`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "An error occurred while generating the PDF." },
      { status: 500 }
    );
  }
}
