import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import user, { user as userSchema } from "../../../schemas/User.schema";
import { z } from "zod";

const prisma = new PrismaClient();

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const {
      firstname,
      middlename,
      lastname,
      role,
      status,
      username,
      password,
    } = await userSchema.parseAsync(body);

    // Create the user
    const createUser = await prisma.user.create({
      data : {
       firstname,
        middlename,
        lastname,
        role,
        status,
        username,
        password,
      },
    });

    return NextResponse.json(createUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
      select: {
        userid: true,
        firstname: true,
        middlename: true,
        lastname: true,
        role: true,
        status: true,
        username: true,
        password: true,
      },
    });

    return NextResponse.json(users, { status: 200 });
  }
  catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const PUT = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const {
      userid,
      firstname,
      middlename,
      lastname,
      role,
      status,
      username,
      password,
    } = await userSchema.parseAsync(body);

    let userFound = await prisma.user.findFirst({
      where: {
        userid,
      },
    });

    if (!userFound) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    } else {
      // Update the user
      const updateUser = await prisma.user.update({
        where: { userid },
        data: {
          firstname,
          middlename,
          lastname,
          role,
          status,
          username,
          password,
        },
      });

      return NextResponse.json(updateUser, { status: 200 });
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const DELETE = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { userid } = await z.object({
      userid: z.number(),
    }).parseAsync(body);

    let userFound = await prisma.user.findFirst({
      where: {
        userid,
      },
    });

    if (!userFound) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    } else {
      // Delete the user
      const deleteUser = await prisma.user.delete({
        where: { userid },
      });

      return NextResponse.json(deleteUser, { status: 200 });
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

