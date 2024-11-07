import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ documentnumber: string }> }
) {
  const resolvedParams = await params;

  const { documentnumber } = resolvedParams;

  try {
    if (!documentnumber) {
      return NextResponse.json(
        { message: "Document number is required." },
        { status: 400 }
      );
    }

    const document = await prisma.documentNumber.findUnique({
      where: {
        documentnumber,
      },
    });

    if (document) {
      return NextResponse.json({
        exists: true,
        documentnumberid: document.documentnumberid,
      });
    } else {
      return NextResponse.json({ exists: false });
    }
  } catch (error) {
    console.error("Error checking document number:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
