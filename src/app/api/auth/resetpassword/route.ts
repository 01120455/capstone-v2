import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    const user = await prisma.user.findFirst({
      where: {
        resettoken: token,
        resettokenexpires: {
          gte: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { userid: user.userid },
      data: {
        password: hashedPassword,
        resettoken: null,
        resettokenexpires: null,
      },
    });

    return NextResponse.json({ message: "Password reset successful" });
  } catch (error) {
    return NextResponse.json(
      { message: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
