import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { username, password } = await req.json();

    // Fetch the user from the database
    const user = await prisma.user.findUnique({ where: { username } });

    // Check if the user exists and if the password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Check if the user is marked as deleted
    if (user.deleted) {
      return NextResponse.json({ message: "invalid account" }, { status: 403 });
    }

    // Create a response object
    const res = NextResponse.json({
      message: "Logged in Successfully",
      role: user.role,
    });

    // Initialize the session
    const session = await getIronSession(req, res, sessionOptions);
    session.user = {
      userid: user.userid,
      imagepath: user.imagepath,
      firstname: user.firstname,
      middlename: user.middlename ?? undefined,
      lastname: user.lastname,
      role: user.role,
      username: user.username,
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
