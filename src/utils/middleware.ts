// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import { getIronSession, IronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const session = await getIronSession(
    req,
    NextResponse.next(),
    sessionOptions
  );

  // Check if user is authenticated
  if (!session) {
    return NextResponse.redirect("/login"); // Redirect to login if not authenticated
  }

  return NextResponse.next(); // Continue to the requested page
}
