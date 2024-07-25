import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json(
      { message: "Invalid username or password" },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ 
    message: "Logged in",
    role: user.role, 
  });

  const session = await getIronSession(req, res, sessionOptions);
  session.user = {
    userid: user.userid,
    firstname: user.firstname,
    middlename: user.middlename ?? undefined,
    lastname: user.lastname,
    role: user.role,
    username: user.username,
    isLoggedIn: true,
  };
  await session.save();
  return res;
}
