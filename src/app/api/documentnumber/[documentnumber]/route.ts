// pages/api/invoicenumber/[invoicenumber].ts

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Define the type for the params
interface Params {
  documentnumber: string;
}

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { documentnumber } = params;

  if (!documentnumber) {
    return NextResponse.json(
      { message: "Document number is required." },
      { status: 400 }
    );
  }

  try {
    const exists = await prisma.documentNumber.findUnique({
      where: {
        documentnumber,
        deleted: false,
      },
    });

    return NextResponse.json({ exists: !!exists });
  } catch (error) {
    console.error("Error checking document number:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}