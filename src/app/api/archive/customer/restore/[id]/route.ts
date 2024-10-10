import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const PUT = async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const id = parseInt(pathname.split("/").pop() as string, 10);

    const updateSupplier = await prisma.$transaction(async (prisma) => {
      const existingSupplier = await prisma.entity.findUnique({
        where: { entityid: id },
      });

      if (!existingSupplier) {
        throw new Error("Supplier not found");
      }

      const findSupplierRole = await prisma.entityRole.findMany({
        where: {
          entityid: id,
          role: "customer",
        },
      });

      const updateSupplier = await prisma.entityRole.update({
        where: {
          roleid: findSupplierRole[0].roleid,
        },
        data: {
          deleted: false,
        },
      });

      return updateSupplier;
    });

    return NextResponse.json(updateSupplier, { status: 200 });
  } catch (error) {
    console.error("Error restoring Supplier:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
