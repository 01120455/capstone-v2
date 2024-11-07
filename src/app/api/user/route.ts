import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { user as userSchema } from "../../../schemas/User.schema";
import { z } from "zod";
import { hashPassword } from "../../../utils/hash";
import { stat, mkdir, writeFile, unlink } from "fs/promises";
import { join } from "path";
import mime from "mime";
import _ from "lodash";

const prisma = new PrismaClient();

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

enum Role {
  admin = "admin",
  manager = "manager",
  sales = "sales",
  inventory = "inventory",
}

enum Status {
  active = "active",
  inactive = "inactive",
}

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const firstname = formData.get("firstname") as string;
    const middlename = formData.get("middlename") as string;
    const lastname = formData.get("lastname") as string;
    const role = formData.get("role") as Role;
    const status = formData.get("status") as Status;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const image = formData.get("image") as File | null;

    if (!Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (!Object.values(Status).includes(status as Status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!firstname || !lastname || !role || !status || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let fileUrl = null;

    if (image) {
      if (image.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: "Image size too large" },
          { status: 400 }
        );
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
        return NextResponse.json(
          { error: "Invalid image type" },
          { status: 400 }
        );
      }

      const buffer = await image.arrayBuffer();

      const sanitizedFolderName = `${firstname}_${lastname}`.replace(
        /[^a-zA-Z0-9-_]/g,
        "_"
      );
      const relativeUploadDir = `/uploads/user_image/${sanitizedFolderName}`;
      const uploadDir = join(process.cwd(), "public", relativeUploadDir);

      try {
        await stat(uploadDir);
      } catch (e: any) {
        if (e.code === "ENOENT") {
          await mkdir(uploadDir, { recursive: true });
        } else {
          console.error(
            "Error while trying to create directory when uploading a file\n",
            e
          );
          return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
          );
        }
      }

      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const filename = `${image.name.replace(
        /[^a-zA-Z0-9-_]/g,
        "_"
      )}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
      await writeFile(`${uploadDir}/${filename}`, Buffer.from(buffer));
      fileUrl = `${relativeUploadDir}/${filename}`;
    }

    const hashedPassword = await hashPassword(password);

    const createUser = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          firstname,
          middlename,
          lastname,
          role,
          status,
          email,
          password: hashedPassword,
          imagepath: fileUrl,
        },
      });

      return user;
    });

    return NextResponse.json(createUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export async function GET(req: NextRequest) {
  try {
    const users = await prisma.user.findMany({
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
    });

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export const PUT = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const userid = parseInt(formData.get("userid") as string, 10);
    const firstname = formData.get("firstname") as string;
    const middlename = formData.get("middlename") as string;
    const lastname = formData.get("lastname") as string;
    const role = formData.get("role") as Role;
    const status = formData.get("status") as Status;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string | null; 
    const image = formData.get("image") as File | null;

    if (!Object.values(Role).includes(role as Role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    if (!Object.values(Status).includes(status as Status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (!firstname || !lastname || !role || !status || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updateUser = await prisma.$transaction(async (prisma) => {
      const existingUser = await prisma.user.findUnique({
        where: { userid },
      });

      if (!existingUser) {
        throw new Error("User not found");
      }

      let fileUrl = existingUser.imagepath || null; 

      if (image) {
        if (image.size > MAX_FILE_SIZE) {
          throw new Error("Image size too large");
        }

        if (!ACCEPTED_IMAGE_TYPES.includes(image.type)) {
          throw new Error("Invalid image type");
        }

        const buffer = await image.arrayBuffer();

        const sanitizedFolderName = `${firstname}_${lastname}`.replace(
          /[^a-zA-Z0-9-_]/g,
          "_"
        );
        const relativeUploadDir = `/uploads/user_image/${sanitizedFolderName}`;
        const uploadDir = join(process.cwd(), "public", relativeUploadDir);

        try {
          await stat(uploadDir);
        } catch (e: any) {
          if (e.code === "ENOENT") {
            await mkdir(uploadDir, { recursive: true });
          } else {
            throw new Error("Error while creating directory");
          }
        }

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `${image.name.replace(
          /[^a-zA-Z0-9-_]/g,
          "_"
        )}-${uniqueSuffix}.${mime.getExtension(image.type)}`;
        await writeFile(`${uploadDir}/${filename}`, Buffer.from(buffer));
        fileUrl = `${relativeUploadDir}/${filename}`;

        if (existingUser.imagepath) {
          const oldImagePath = join(
            process.cwd(),
            "public",
            existingUser.imagepath
          );
          try {
            await unlink(oldImagePath);
          } catch (e: any) {
            console.error("Error deleting old image:", e);
          }
        }
      }

      const hashedPassword = password
        ? await hashPassword(password)
        : undefined;

      const updatedUser = await prisma.user.update({
        where: { userid },
        data: {
          firstname,
          middlename,
          lastname,
          role,
          status,
          email,
          password: hashedPassword,
          imagepath: fileUrl,
        },
      });

      return updatedUser;
    });

    return NextResponse.json(updateUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

