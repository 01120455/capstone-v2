"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "@/interfaces/user";

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
};

export default function SideMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        window.location.href = "/login";
      } else {
        throw new Error(`Logout failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/session", {
          method: "GET",
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const session = await response.json();
        setUser(session || null);
      } catch (error) {
        console.error("Failed to fetch session", error);
      }
    };
    fetchUser();
  }, []);

  const canAccessMenuItem = (role) => {
    if (user?.role === ROLES.ADMIN) return true;
    if (user?.role === ROLES.MANAGER) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.SALES) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.INVENTORY) return role !== ROLES.ADMIN;
    return false;
  };

  return (
    <div className="relative h-screen">
      <div className="flex flex-col h-screen bg-white shadow-lg lg:w-44">
        <div className="flex items-center justify-between p-4 border-b">
          <button className="lg:hidden text-gray-500" onClick={toggleMenu}>
            <MenuIcon className="w-6 h-6" />
          </button>
          <span className="text-lg font-semibold hidden lg:block">
            Point of Sale
          </span>
        </div>
        <div
          className={`flex flex-col flex-grow overflow-auto lg:block ${
            isMenuOpen ? "block" : "hidden"
          }`}
        >
          <nav className="mt-4 space-y-1">
            {canAccessMenuItem(ROLES.ADMIN) && (
              <>
                <Link
                  className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  href="/dashboard"
                  prefetch={false}
                >
                  <LayoutDashboardIcon className="inline-block w-6 h-6 mr-3" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  href="/product"
                  prefetch={false}
                >
                  <BoxIcon className="inline-block w-6 h-6 mr-3" />
                  <span>Product</span>
                </Link>
                <Link
                  className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  href="/sales"
                  prefetch={false}
                >
                  <DollarSignIcon className="inline-block w-6 h-6 mr-3" />
                  <span>Sales</span>
                </Link>
                <Link
                  className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  href="/saleshistory"
                  prefetch={false}
                >
                  <CalendarIcon className="inline-block w-6 h-6 mr-3" />
                  <span>Sales History</span>
                </Link>
                <Link
                  className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  href="/customer"
                  prefetch={false}
                >
                  <UserIcon className="inline-block w-6 h-6 mr-3" />
                  <span>Customer</span>
                </Link>
                <Link
                  className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  href="/supplier"
                  prefetch={false}
                >
                  <TruckIcon className="inline-block w-6 h-6 mr-3" />
                  <span>Supplier</span>
                </Link>
                <Link
                  className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  href="/user"
                  prefetch={false}
                >
                  <UsersIcon className="inline-block w-6 h-6 mr-3" />
                  <span>Users</span>
                </Link>
              </>
            )}
            {user?.role === ROLES.MANAGER && (
              <>
              <Link
                className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                href="/dashboard"
                prefetch={false}
              >
                <LayoutDashboardIcon className="inline-block w-6 h-6 mr-3" />
                <span>Dashboard</span>
              </Link>
              <Link
                className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                href="/product"
                prefetch={false}
              >
                <BoxIcon className="inline-block w-6 h-6 mr-3" />
                <span>Product</span>
              </Link>
              <Link
                className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                href="/sales"
                prefetch={false}
              >
                <DollarSignIcon className="inline-block w-6 h-6 mr-3" />
                <span>Sales</span>
              </Link>
              <Link
                className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                href="/saleshistory"
                prefetch={false}
              >
                <CalendarIcon className="inline-block w-6 h-6 mr-3" />
                <span>Sales History</span>
              </Link>
              <Link
                className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                href="/customer"
                prefetch={false}
              >
                <UserIcon className="inline-block w-6 h-6 mr-3" />
                <span>Customer</span>
              </Link>
              <Link
                className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                href="/supplier"
                prefetch={false}
              >
                <TruckIcon className="inline-block w-6 h-6 mr-3" />
                <span>Supplier</span>
              </Link>
            </>
            )}
            {user?.role === ROLES.SALES && (
              <>
                <Link
                  className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  href="/sales"
                  prefetch={false}
                >
                  <DollarSignIcon className="inline-block w-6 h-6 mr-3" />
                  <span>Sales</span>
                </Link>
                <Link
                  className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  href="/saleshistory"
                  prefetch={false}
                >
                  <CalendarIcon className="inline-block w-6 h-6 mr-3" />
                  <span>Sales History</span>
                </Link>
              </>
            )}
            {user?.role === ROLES.INVENTORY && (
              <>
                <Link
                  className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  href="/product"
                  prefetch={false}
                >
                  <BoxIcon className="inline-block w-6 h-6 mr-3" />
                  <span>Product</span>
                </Link>
                <Link
                  className="block p-3 text-base font-medium text-gray-700 hover:bg-gray-100"
                  href="/supplier"
                  prefetch={false}
                >
                  <TruckIcon className="inline-block w-6 h-6 mr-3" />
                  <span>Supplier</span>
                </Link>
              </>
            )}
          </nav>

          <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>{user?.firstname?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-800">
                  {user?.firstname && user?.lastname
                    ? `${user.firstname} ${user.lastname}`
                    : "Guest"}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.username || "guest"}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <EllipsisIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                  className="w-full p-2 text-left text-sm text-gray-800 hover:bg-gray-100"
                  onClick={() => window.location.href = "/profile"}>
                        <ProfileIcon className="inline-block mr-2 h-4 w-4" />
                        <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="w-full p-2 text-left text-sm text-gray-800 hover:bg-gray-100"
                    onClick={logout}
                  >
                    <LogoutIcon className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}


function LogoutIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  );
}

function ProfileIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EllipsisIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#374151"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function BoxIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function LayoutDashboardIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="9" />
      <rect x="14" y="3" width="7" height="5" />
      <rect x="14" y="12" width="7" height="9" />
      <rect x="3" y="16" width="7" height="5" />
    </svg>
  );
}

function DollarSignIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 1v22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function UserIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function TruckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

function UsersIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" x2="21" y1="12" y2="12" />
      <line x1="3" x2="21" y1="6" y2="6" />
      <line x1="3" x2="21" y1="18" y2="18" />
    </svg>
  );
}
