import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const suppliers = await prisma.entity.findMany({
    where: {
      roles: {
        some: {
          role: "supplier", // Only fetch entities with the "supplier" role
          deleted: true,
        },
      },
    },
    include: {
      roles: true, // Include the related roles
    },
  });
  return NextResponse.json(suppliers);
}