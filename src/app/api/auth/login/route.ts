import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email} });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }


    const res = NextResponse.json({
      message: "Logged in Successfully",
      role: user.role,
      email: user.email,
    });

    const session = await getIronSession(req, res, sessionOptions);
    // @ts-ignore
    session.user = {
      userid: user.userid,
      imagepath: user.imagepath,
      firstname: user.firstname,
      middlename: user.middlename ?? undefined,
      lastname: user.lastname,
      role: user.role,
      email: user.email,
      status: user.status,
      isLoggedIn: true,
    };
    await session.save();

    return res;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
