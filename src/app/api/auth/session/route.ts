import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getIronSession(
    req,
    NextResponse.next(),
    sessionOptions
  );
  // @ts-ignore
  if (!session.user?.isLoggedIn) {
    // console.log("Session:", session);
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  // @ts-ignore
  return NextResponse.json(session.user);
}
