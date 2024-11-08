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

  // console.log("Session in middleware:", session);

  const accessRules: Record<string, string[]> = {
    admin: [
      "/dashboard",
      "/product",
      "/sales",
      "/salesitem",
      "/saleshistory",
      "/purchase",
      "/purchaseditemsfrommilling",
      "/purchaseditemsfromilling",
      "/purchasehistory",
      "/user",
    ],
    manager: [
      "/dashboard",
      "/product",
      "/sales",
      "/salesitem",
      "/saleshistory",
      "/purchase",
      "/purchaseditemsfrommilling",
      "/purchaseditemsfromilling",
      "/purchasehistory",
    ],
    sales: ["/sales", "/saleshistory", "/salesitem"],
    inventory: [
      "/product",
      "/saleshistory",
      "/salesitem",
      "/purchasehistory",
      "/purchaseditemsfrommilling",
      "/purchaseditemsfromilling",
    ],
  };


  const userSession = session;
  const userRole = (userSession as UserSession).user?.role;

  // console.log("User Role:", userRole);

  const protectedPaths = [
    "/dashboard",
    "/product",
    "/sales",
    "/salesitem",
    "/saleshistory",
    "/purchase",
    "/purchaseditemsfrommilling",
    "/purchaseditemsfromilling",
    "/purchasehistory",
    "/user",
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
    "/salesitem/:path*",
    "/saleshistory/:path*",
    "/purchase/:path*",
    "/purchaseditemsfrommilling/:path*",
    "/purchaseditemsfromilling/:path*",
    "/purchasehistory/:path*",
    "/user/:path*",
  ],
};
