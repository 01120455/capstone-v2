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

export const PUT = async (req: NextRequest) => {
  try {
    const { pathname } = new URL(req.url);
    const transactionId = parseInt(pathname.split("/").pop() as string, 10);

    const session = await getIronSession(
      req,
      NextResponse.next(),
      sessionOptions
    ); // @ts-ignore
    const userid = session.user.userid;
    const formData = await req.formData();

    const statusString = formData.get("status") as string;
    const status = statusString as Status;

    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    if (!Object.values(Status).includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updatedPurchase = await prisma.$transaction(async (tx) => {
      const existingPurchase = await tx.transaction.findUnique({
        where: { transactionid: transactionId },
      });

      if (!existingPurchase) {
        throw new Error("Purchase not found");
      }

      const updatedPurchase = await tx.transaction.update({
        where: { transactionid: transactionId },
        data: {
          lastmodifiedby: userid,
          status: status,
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
