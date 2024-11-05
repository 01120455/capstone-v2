import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { stat, mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import mime from "mime";
import _ from "lodash";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  try {
    // Get filter values from searchParams matching your frontend
    const startDate = searchParams.get("startDate"); // Changed from startdate to startDate
    const endDate = searchParams.get("endDate"); // Changed from enddate to endDate
    const period = searchParams.get("period"); // Added period parameter

    // Build the where clause based on filters
    const whereClause: any = {
      status: "active",
    };

    if (startDate && endDate) {
      // Date range filter
      whereClause.lastmodifiedat = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (period) {
      // Period filter
      const now = new Date();
      let periodStartDate = new Date();

      switch (period) {
        case "7days":
          periodStartDate.setDate(now.getDate() - 7);
          break;
        case "1month":
          periodStartDate.setMonth(now.getMonth() - 1);
          break;
        case "6months":
          periodStartDate.setMonth(now.getMonth() - 6);
          break;
        case "1year":
          periodStartDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          // Default to last 7 days if period is invalid
          periodStartDate.setDate(now.getDate() - 7);
      }

      whereClause.lastmodifiedat = {
        gte: periodStartDate,
        lte: now,
      };
    }

    const items = await prisma.item.findMany({
      where: whereClause,
      select: {
        itemid: true,
        itemname: true,
        itemtype: true,
        sackweight: true,
        status: true,
        unitofmeasurement: true,
        stock: true,
        unitprice: true,
        imagepath: true,
        User: {
          select: {
            userid: true,
            firstname: true,
            middlename: true,
            lastname: true,
          },
        },
        lastmodifiedat: true,
        lastmodifiedby: true,
      },
      orderBy: {
        lastmodifiedat: "desc",
      },
    });

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

    const convertedItems = convertBigIntToString(items);

    return NextResponse.json(convertedItems, { status: 200 });
  } catch (error) {
    console.error("Error getting purchases:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
