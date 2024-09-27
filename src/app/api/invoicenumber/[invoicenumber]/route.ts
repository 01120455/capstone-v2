// pages/api/invoicenumber/[invoicenumber].ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the type for the params
interface Params {
  invoicenumber: string;
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { invoicenumber } = params; // Get the invoice number from params

  if (!invoicenumber) {
    return NextResponse.json(
      { message: "Invoice number is required." },
      { status: 400 }
    );
  }

  try {
    const exists = await prisma.invoiceNumber.findUnique({
      where: {
        invoicenumber,
        deleted: false,
      },
    });

    return NextResponse.json({ exists: !!exists });
  } catch (error) {
    console.error("Error checking invoice number:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
