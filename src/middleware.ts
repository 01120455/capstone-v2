import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";

interface UserSession {
  user?: {
    role: "admin" | "manager" | "sales" | "inventory"; // Adjust roles as needed
    // Add other user properties if necessary
  };
}

export async function middleware(req: NextRequest) {
  // Get the session
  const session = await getIronSession(
    req,
    NextResponse.next(),
    sessionOptions
  );

  console.log("Session:", session);

  // Define role-based access rules
  const accessRules: Record<string, string[]> = {
    admin: [
      "/dashboard",
      "/product",
      "/sales",
      "/saleshistory",
      "/customer",
      "/purchase",
      "/purchasehistory",
      "/supplier",
      "/user",
    ],
    manager: [
      "/dashboard",
      "/product",
      "/sales",
      "/saleshistory",
      "/customer",
      "/purchase",
      "/purchasehistory",
      "/supplier",
    ],
    sales: ["/sales", "/saleshistory", "/customer"],
    inventory: ["/product", "/supplier"],
  };

  // Get user role from session
  const userSession = session as UserSession; // Type assertion
  const userRole = userSession.user?.role; // Adjust this based on your session structure

  // Define the paths you want to protect
  const protectedPaths = [
    "/dashboard",
    "/product",
    "/sales",
    "/saleshistory",
    "/customer",
    "/purchase",
    "/purchasehistory",
    "/supplier",
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
    "/saleshistory/:path*",
    "/customer/:path*",
    "/purchase/:path*",
    "/purchasehistory/:path*",
    "/supplier/:path*",
    "/user/:path*",
  ],
};
