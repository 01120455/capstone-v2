import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import _ from "lodash";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

enum Status {
  pending = "pending",
  paid = "paid",
  cancelled = "cancelled",
}

// export const PUT = async (req: NextRequest) => {
//   try {
//     const { pathname } = new URL(req.url);
//     const transactionId = parseInt(pathname.split("/").pop() as string, 10);

//     const session = await getIronSession(
//       req,
//       NextResponse.next(),
//       sessionOptions
//     );
//     const userid = session.user.userid;
//     const formData = await req.formData();

//     const invoicenumber = formData.get("invoicenumber") as string;
//     const frommilling = formData.get("frommilling") === "true";
//     const firstname = formData.get("Entity[firstname]") as string;
//     const middlename = formData.get("Entity[middlename]") as string;
//     const lastname = formData.get("Entity[lastname]") as string;
//     const contactnumber = formData.get("Entity[contactnumber]") as string;
//     const statusString = formData.get("status") as string;
//     const status = statusString as Status;
//     const walkin = formData.get("walkin") === "true";
//     const taxpercentage =
//       parseFloat(formData.get("taxpercentage") as string) || 0; // Set default to 0 if NaN

//     if (isNaN(transactionId)) {
//       return NextResponse.json(
//         { error: "Invalid transaction ID" },
//         { status: 400 }
//       );
//     }

//     // Validate Supplier Information
//     if (!firstname || !lastname || !contactnumber) {
//       return NextResponse.json(
//         { error: "Supplier name and contact number are required" },
//         { status: 400 }
//       );
//     }

//     if (!invoicenumber) {
//       return NextResponse.json(
//         { error: "Invoice number is required" },
//         { status: 400 }
//       );
//     }

//     // Ensure status is valid
//     if (!Object.values(Status).includes(status)) {
//       return NextResponse.json({ error: "Invalid status" }, { status: 400 });
//     }

//     // Normalize middlename if it is null
//     const normalizedMiddlename = middlename || "";

//     // Execute Prisma transaction
//     const updatedPurchase = await prisma.$transaction(async (tx) => {
//       // Find existing purchase
//       const existingPurchase = await tx.transaction.findUnique({
//         where: { transactionid: transactionId },
//       });

//       if (!existingPurchase) {
//         throw new Error("Purchase not found");
//       }

//       const totalAmount = existingPurchase.totalamount ?? 0;
//       const taxAmount = totalAmount * (taxpercentage / 100);
//       const totalAmountMinusTax = totalAmount - taxAmount;

//       // Find or create supplier
//       let supplierId;
//       const existingSupplier = await tx.entity.findUnique({
//         where: { entityid: existingPurchase.entityid },
//       });

//       if (existingSupplier) {
//         supplierId = existingSupplier.entityid;
//       } else {
//         const newSupplier = await tx.entity.create({
//           data: {
//             type: "supplier",
//             firstname,
//             middlename: normalizedMiddlename,
//             lastname,
//             contactnumber,
//           },
//         });
//         supplierId = newSupplier.entityid;
//       }

//       // Update purchase
//       const updatedPurchase = await tx.transaction.update({
//         where: { transactionid: transactionId },
//         data: {
//           lastmodifiedby: userid,
//           entityid: supplierId,
//           status: status,
//           walkin: walkin,
//           frommilling: frommilling,
//           taxpercentage: taxpercentage,
//           taxamount: taxAmount,
//           totalamount: totalAmountMinusTax,
//         },
//       });

//       return updatedPurchase;
//     });

//     return NextResponse.json(updatedPurchase, { status: 200 });
//   } catch (error) {
//     console.error("Error updating purchase:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// };

export const PUT = async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const transactionId = parseInt(pathname.split("/").pop() as string, 10);

    const session = await getIronSession(
      req,
      NextResponse.next(),
      sessionOptions
    );
    const userid = session.user.userid;
    const formData = await req.formData();

    const invoicenumber = formData.get("invoicenumber") as string;
    const frommilling = formData.get("frommilling") === "true";
    const name = formData.get("Entity[name]") as string;
    const contactnumber = formData.get("Entity[contactnumber]") as string;
    const statusString = formData.get("status") as string;
    const status = statusString as Status;
    const walkin = formData.get("walkin") === "true";
    const taxpercentage =
      parseFloat(formData.get("taxpercentage") as string) || 0;

    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    // Validate Supplier Information
    if (!name) {
      return NextResponse.json(
        { error: "Supplier name are required" },
        { status: 400 }
      );
    }

    if (!invoicenumber) {
      return NextResponse.json(
        { error: "Invoice number is required" },
        { status: 400 }
      );
    }

    // Ensure status is valid
    if (!Object.values(Status).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const contactNumberIfNull = contactnumber || "";

    // Execute Prisma transaction
    const updatedPurchase = await prisma.$transaction(async (tx) => {
      // Find existing purchase
      const existingPurchase = await tx.transaction.findUnique({
        where: { transactionid: transactionId },
      });

      if (!existingPurchase) {
        throw new Error("Purchase not found");
      }

      const totalAmount = existingPurchase.totalamount ?? 0;
      const taxAmount = totalAmount * (taxpercentage / 100);
      const totalAmountMinusTax = totalAmount - taxAmount;

      // Find or create supplier entity with the appropriate role
      let entityId;
      const existingEntity = await tx.entity.findFirst({
        where: {
          name: name
        },
        include: { roles: true },
      });

      if (existingEntity) {
        entityId = existingEntity.entityid;

        // Check if the entity has the correct role
        const hasRole = existingEntity.roles.some((r) => r.role === "supplier");
        if (!hasRole) {
          // Add the role if it doesn't exist
          await tx.entityRole.create({
            data: {
              entityid: entityId,
              role: "supplier",
            },
          });
        }
      } else {
        // If the entity does not exist, create a new entity and role
        const newEntity = await tx.entity.create({
          data: {
            name,
            contactnumber: contactNumberIfNull,
            roles: {
              create: [
                {
                  role: "supplier",
                },
              ], // Create the role along with the entity
            },
          },
        });
        entityId = newEntity.entityid;
      }

      let invoiceNumberId;
      const existingInvoiceNumber = await tx.invoiceNumber.findFirst({
        where: { invoicenumber: invoicenumber },
      });

      if (existingInvoiceNumber) {
        invoiceNumberId = existingInvoiceNumber.invoicenumberid;
      } else {
        const newInvoiceNumber = await tx.invoiceNumber.update({
          where: { invoicenumberid: existingPurchase.invoicenumberid || 0 },
          data: {
            invoicenumber: invoicenumber,
          },
        });
        invoiceNumberId = newInvoiceNumber.invoicenumberid;
      }

      // Update purchase
      const updatedPurchase = await tx.transaction.update({
        where: { transactionid: transactionId },
        data: {
          lastmodifiedby: userid,
          entityid: entityId,
          invoicenumberid: invoiceNumberId,
          status: status,
          walkin: walkin,
          frommilling: frommilling,
          taxpercentage: taxpercentage,
          taxamount: taxAmount,
          totalamount: totalAmountMinusTax,
        },
      });

      return updatedPurchase;
    });

    return NextResponse.json(updatedPurchase, { status: 200 });
  } catch (error) {
    console.error("Error updating purchase:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
