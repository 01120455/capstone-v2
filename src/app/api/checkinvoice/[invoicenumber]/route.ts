import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: { invoicenumber: string } }
) {
  try {
    const { invoicenumber } = params; // Get the invoicenumber from the dynamic route

    // If 'invoicenumber' is not provided, return a 400 error
    if (!invoicenumber) {
      return NextResponse.json(
        { error: "Invoice number (documentnumber) is required." },
        { status: 400 }
      );
    }

    // Check if a transaction with this invoicenumber exists in the "sales" type transactions
    const transaction = await prisma.transaction.findFirst({
      where: {
        transactiontype: "sales", // Ensure this is a "sales" transaction
        DocumentNumber: {
          documentnumber: invoicenumber, // Filter by the provided invoicenumber
        },
      },
    });

    // If no matching transaction is found, return 'exists: false'
    if (!transaction) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    // If a matching transaction is found, return 'exists: true'
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
