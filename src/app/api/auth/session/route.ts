// app/api/auth/session/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, NextResponse.next(), sessionOptions);
  if (!session.user?.isLoggedIn) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json(session.user);
}
