import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData, defaultSession } from "@/lib/session";
import { cookies } from "next/headers";
import { compare } from "bcrypt";
import { loginSchema } from "@/schemas/User.schema";

export const getSession = async () => {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = defaultSession.isLoggedIn;
  }
  return session;
};

const prisma = new PrismaClient();

export const POST = async (req: NextRequest) => {
  const session = await getSession();
  try {
    const { username, password } = loginSchema.parse(await req.json());
    const usernames = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!usernames) {
      return new Response(
        JSON.stringify({ message: "Invalid username or password" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const passwordMatch = await compare(password, usernames.password);
    if (!passwordMatch) {
      return new Response(
        JSON.stringify({ message: "Invalid username or password" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    session.isLoggedIn = true;
    session.userId = usernames.userid;
    session.username = usernames.username;
    await session.save();
    return new Response(JSON.stringify({ message: "Login successful" }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Invalid username or password" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
