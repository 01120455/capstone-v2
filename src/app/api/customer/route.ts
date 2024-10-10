import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const customers = await prisma.entity.findMany({
    where: {
      deleted: false,
      roles: {
        some: {
          role: "customer",
          deleted: false,
        },
      },
    },
    include: {
      roles: true,
    },
  });
  return NextResponse.json(customers);
}
