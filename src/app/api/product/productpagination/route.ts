// import { NextRequest, NextResponse } from "next/server";
// import _ from "lodash";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// const convertBigIntToString = (value: any): any => {
//   if (value instanceof Date) {
//     return value.toISOString();
//   }
//   if (typeof value === "bigint") {
//     return value.toString();
//   }
//   if (Array.isArray(value)) {
//     return value.map(convertBigIntToString);
//   }
//   if (value !== null && typeof value === "object") {
//     return Object.fromEntries(
//       Object.entries(value).map(([key, val]) => [
//         key,
//         convertBigIntToString(val),
//       ])
//     );
//   }
//   return value;
// };

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   // Use a fallback value in the parseInt
//   const limit = parseInt(searchParams.get("limit") || "10");
//   const page = parseInt(searchParams.get("page") || "1");

//   const skip = (page - 1) * limit;

//   try {
//     const items = await prisma.item.findMany({
//       where: {
//         recentdelete: false,
//       },
//       select: {
//         itemid: true,
//         name: true,
//         type: true,
//         sackweight: true,
//         unitofmeasurement: true,
//         stock: true,
//         unitprice: true,
//         itemimage: {
//           select: {
//             imagepath: true,
//           },
//         },
//         User: {
//           select: {
//             userid: true,
//             firstname: true,
//             lastname: true,
//           },
//         },
//         lastmodifiedat: true,
//       },
//       orderBy: {
//         lastmodifiedat: "desc",
//       },
//       take: limit,
//       skip,
//     });

//     const convertedItems = convertBigIntToString(items);
//     return NextResponse.json(convertedItems, { status: 200 });
//   } catch (error) {
//     console.error("Error getting items:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

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

  const nameFilter = searchParams.get("name") || "";
  const typeFilter = searchParams.get("type") || "";
  const sackweightFilter = searchParams.get("sackweight") || "";
  const unitofmeasurementFilter = searchParams.get("unitofmeasurement") || "";

  const whereClause: any = {
    recentdelete: false,
  };

  if (nameFilter) {
    whereClause.name = nameFilter;
  }

  if (typeFilter) {
    whereClause.type = typeFilter;
  }

  if (sackweightFilter) {
    whereClause.sackweight = sackweightFilter;
  }

  if (unitofmeasurementFilter) {
    whereClause.unitofmeasurement = unitofmeasurementFilter;
  }

  try {
    const items = await prisma.item.findMany({
      where: whereClause,
      select: {
        itemid: true,
        name: true,
        type: true,
        sackweight: true,
        unitofmeasurement: true,
        stock: true,
        unitprice: true,
        itemimage: {
          select: {
            imagepath: true,
          },
        },
        User: {
          select: {
            userid: true,
            firstname: true,
            lastname: true,
          },
        },
        lastmodifiedat: true,
      },
      orderBy: {
        lastmodifiedat: "desc",
      },
      take: limit,
      skip,
    });

    console.log("Where Clause:", whereClause);

    const convertedItems = convertBigIntToString(items);
    return NextResponse.json(convertedItems, { status: 200 });
  } catch (error) {
    console.error("Error getting items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}