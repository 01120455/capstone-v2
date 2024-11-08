import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const convertBigIntToString = (value: any): any => {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "bigint") {
    return value.toString();
  }
  if (Array.isArray(value)) {
    return value.map(convertBigIntToString);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [
        key,
        convertBigIntToString(val),
      ])
    );
  }
  return value;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const limit = parseInt(searchParams.get("limit") || "10");
  const page = parseInt(searchParams.get("page") || "1");
  const skip = (page - 1) * limit;

  const emailFilter = searchParams.get("email") || "";
  const firstNameFilter = searchParams.get("firstname") || "";
  const middleNameFilter = searchParams.get("middlename") || "";
  const lastNameFilter = searchParams.get("lastname") || "";
  const roleFilter = searchParams.get("role") || "";
  const statusFilter = searchParams.get("status") || "";

  const whereClause: any = {};

  if (emailFilter) {
    whereClause.email = emailFilter;
  }

  if (firstNameFilter) {
    whereClause.firstname = firstNameFilter;
  }

  if (middleNameFilter) {
    whereClause.middlename = middleNameFilter;
  }

  if (lastNameFilter) {
    whereClause.lastname = lastNameFilter;
  }

  if (roleFilter) {
    whereClause.role = roleFilter;
  }

  if (statusFilter) {
    whereClause.status = statusFilter;
  }

  try {
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        userid: true,
        imagepath: true,
        firstname: true,
        middlename: true,
        lastname: true,
        role: true,
        status: true,
        email: true,
        password: true,
      },
      orderBy: {
        createdat: "desc",
      },
      take: limit,
      skip,
    });

    // console.log("where:", whereClause);

    const convertedUsers = convertBigIntToString(users);
    return NextResponse.json(convertedUsers, { status: 200 });
  } catch (error) {
    console.error("Error getting users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
