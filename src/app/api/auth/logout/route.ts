import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ message: "Logged out" });
  const session = await getIronSession(req, res, sessionOptions);
  session.destroy();
  return res;
}
