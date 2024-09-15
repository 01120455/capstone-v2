import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const suppliers = await prisma.entity.findMany({
    where: {
      type: "supplier",
      deleted: false,
    },
  });
  return NextResponse.json(suppliers);
}
