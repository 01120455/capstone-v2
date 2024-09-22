import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const suppliers = await prisma.entity.findMany({
    where: {
      deleted: false,
      roles: {
        some: {
          role: "supplier", // Only fetch entities with the "supplier" role
        },
      },
    },
    include: {
      roles: true, // Include the related roles
    },
  });
  return NextResponse.json(suppliers);
}

export const PUT = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const entityid = parseInt(formData.get("entityid") as string, 10);
    const firstname = formData.get("firstname") as string;
    const middlename = formData.get("middlename") as string;
    const lastname = formData.get("lastname") as string;
    const contactnumber = formData.get("contactnumber") as string;

    // Check for required fields
    if (!entityid) {
      return NextResponse.json(
        { error: "entityid is required to update a supplier" },
        { status: 400 }
      );
    }

    if (!firstname && !lastname) {
      return NextResponse.json(
        { error: "firstname or lastname is required to update a supplier" },
        { status: 400 }
      );
    }

    // Use a transaction for the update operation
    const updateSupplier = await prisma.$transaction(async (prisma) => {
      const existingSupplier = await prisma.entity.findFirst({
        where: {
          entityid, // Use entityid to find the supplier
        },
        include: {
          roles: true,
        },
      });

      // Check if supplier exists and has the right role
      if (!existingSupplier) {
        throw new Error("Supplier not found");
      }

      if (!existingSupplier.roles.some((role) => role.role === "supplier")) {
        throw new Error("Entity is not a supplier");
      }

      // Perform the update
      return await prisma.entity.update({
        where: {
          entityid,
        },
        data: {
          firstname,
          middlename,
          lastname,
          contactnumber,
        },
      });
    });

    return NextResponse.json(updateSupplier, { status: 200 });

  } catch (error) {
    console.error("Error updating supplier:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
};
