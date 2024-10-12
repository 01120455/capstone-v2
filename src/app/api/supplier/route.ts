import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const suppliers = await prisma.entity.findMany({
    where: {
      deleted: false,
      roles: {
        some: {
          role: "supplier",
          deleted: false,
        },
      },
    },
    include: {
      roles: true,
    },
  });
  return NextResponse.json(suppliers);
}

export const PUT = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const entityid = parseInt(formData.get("entityid") as string, 10);
    const name = formData.get("name") as string;
    const contactnumber = formData.get("contactnumber") as string;

    const contactNumberIfNull = contactnumber || "";

    if (!entityid) {
      return NextResponse.json(
        { error: "entityid is required to update a supplier" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "name is required to update a supplier" },
        { status: 400 }
      );
    }

    const updateSupplier = await prisma.$transaction(async (prisma) => {
      const existingSupplier = await prisma.entity.findFirst({
        where: {
          entityid,
        },
        include: {
          roles: true,
        },
      });

      if (!existingSupplier) {
        throw new Error("Supplier not found");
      }

      if (!existingSupplier.roles.some((role) => role.role === "supplier")) {
        throw new Error("Entity is not a supplier");
      }

      return await prisma.entity.update({
        where: {
          entityid,
        },
        data: {
          name,
          contactnumber: contactNumberIfNull,
        },
      });
    });

    return NextResponse.json(updateSupplier, { status: 200 });
  } catch (error) {
    console.error("Error updating supplier:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
};
