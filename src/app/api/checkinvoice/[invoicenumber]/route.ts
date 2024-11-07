import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ invoicenumber: string }> }
) {
  try {
    const resolvedParams = await params;

    const { invoicenumber } = resolvedParams;

    if (!invoicenumber) {
      return NextResponse.json(
        { error: "Invoice number (documentnumber) is required." },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        transactiontype: "sales",
        DocumentNumber: {
          documentnumber: invoicenumber,
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json({ exists: true }, { status: 200 });
  } catch (error) {
    console.error(
      "Error checking for invoice number in sales transactions:",
      error
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
