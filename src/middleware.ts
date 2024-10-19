import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

interface UserSession {
  user?: {
    role: "admin" | "manager" | "sales" | "inventory";
  };
}

export async function middleware(req: NextRequest) {
  const session = await getIronSession(
    req,
    NextResponse.next(),
    sessionOptions
  );

  // console.log("Session:", session);

  const accessRules: Record<string, string[]> = {
    admin: [
      "/dashboard",
      "/product",
      "/sales",
      "/saleshistory",
      "/purchase",
      "/purchasehistory",
      "/user",
      "/archive",
    ],
    manager: [
      "/dashboard",
      "/product",
      "/sales",
      "/saleshistory",
      "/purchase",
      "/purchasehistory",
    ],
    sales: ["/sales", "/saleshistory"],
    inventory: ["/product"],
  };

  const userSession = session as UserSession;
  const userRole = userSession.user?.role;

  const protectedPaths = [
    "/dashboard",
    "/product",
    "/sales",
    "/saleshistory",
    "/purchase",
    "/purchasehistory",
    "/user",
    "/archive",
  ];

  // Check if the request URL matches any of the protected paths
  if (protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))) {
    // If user role is not defined or does not have access, redirect to access denied page
    if (!userRole || !accessRules[userRole]?.includes(req.nextUrl.pathname)) {
      const url = req.nextUrl.clone();
      url.pathname = "/accessdenied"; // Redirect to an unauthorized page
      return NextResponse.redirect(url);
    }
  }

  // If user is authenticated or path is not protected, continue
  return NextResponse.next();
}

// Configure matcher to apply middleware to all protected routes
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/product/:path*",
    "/sales/:path*",
    "/saleshistory/:path*",
    "/purchase/:path*",
    "/purchasehistory/:path*",
    "/user/:path*",
    "/archive/:path*",
  ],
};
