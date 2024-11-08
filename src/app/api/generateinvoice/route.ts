import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb } from "pdf-lib";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { transactionId } = await req.json(); 

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
        DocumentNumber: {
          select: {
            documentnumber: true,
          },
        },
        createdbyuser: {
          select: {
            firstname: true,
            middlename: true,
            lastname: true,
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
    const margin = 30;

    page.drawText(
      `Invoice No.: ${transaction.DocumentNumber?.documentnumber}`,
      {
        x: margin,
        y: height - margin,
        size: fontSize,
        color: rgb(0, 0, 0),
      }
    );
    page.drawText(
      `Date: ${transaction.createdat.toISOString().split("T")[0]}`,
      {
        x: margin,
        y: height - margin - 20,
        size: fontSize,
        color: rgb(0, 0, 0),
      }
    );
    page.drawText(`Status: ${transaction.status}`, {
      x: margin,
      y: height - margin - 40,
      size: fontSize,
      color: rgb(0, 0, 0),
    });
    page.drawText(
      `Created by: ${transaction.createdbyuser.firstname} ${
        transaction.createdbyuser?.middlename || ""
      } ${transaction.createdbyuser.lastname}`,
      {
        x: margin,
        y: height - margin - 60,
        size: fontSize,
        color: rgb(0, 0, 0),
      }
    );

    let tableY = height - margin - 100;

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
      let xPosition = margin + index * 80;
      if (header === "Item Type") xPosition -= 10; 
      if (header === "Sack Weight") xPosition -= 25; 
      if (header === "Unit of Measurement") xPosition -= 25; 
      if (header === "Stock") xPosition += 20; 
      if (header === "Unit Price") xPosition -= 20; 
      if (header === "Total Amount") xPosition -= 30; 

      page.drawText(header, {
        x: xPosition,
        y: headerY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    });

    transaction.TransactionItem.forEach((item, index) => {
      const itemY = headerY - (index + 1) * 20;

      page.drawText(item.Item?.itemname || "N/A", {
        x: margin,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.Item?.itemtype || "N/A", {
        x: margin + 70,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.sackweight.toString() || "0", {
        x: margin + 135, 
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.unitofmeasurement || "N/A", {
        x: margin + 215,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.stock.toString() || "0", {
        x: margin + 320 + 30, 
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText(item.unitprice.toFixed(2) || "0.00", {
        x: margin + 380,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
      page.drawText((item.stock * item.unitprice).toFixed(2) || "0.00", {
        x: margin + 450,
        y: itemY,
        size: fontSize,
        color: rgb(0, 0, 0),
      });
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${transaction.DocumentNumber?.documentnumber}.pdf`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "An error occurred while generating the PDF." },
      { status: 500 }
    );
  }
}
