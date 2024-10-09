"use client";
import { useAuth } from "../utils/hooks/auth";
import SideMenu from "@/components/sidemenu";

export default function Layout() {
  const { isAuthenticated, isLoggedIn, userRole } = useAuth();

  if (isAuthenticated === null) {
    return <p>loading...</p>;
  }

  // if (!isAuthenticated) {
  //   return <AccessDenied />;
  // }

  if (isLoggedIn === null) {
    return <p>loading...</p>;
  }

  if (isLoggedIn === false) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <SideMenu />
    </div>
  );
}
