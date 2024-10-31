import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return NextResponse.json({ message: "Email not found" }, { status: 404 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600 * 1000);

  await prisma.user.update({
    where: { email },
    data: { resettoken: token, resettokenexpires: expires },
  });

  const resetLink = `http://localhost:3000/resetpassword?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Password Reset",
    text: `Click the following link to reset your password: ${resetLink}`,
  });

  return NextResponse.json({ message: "Password reset link sent!" });
}
