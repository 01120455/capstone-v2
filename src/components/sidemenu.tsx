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
import { ScrollArea } from "./ui/scroll-area";
import {
  BoxIcon,
  CalendarIcon,
  DollarSignIcon,
  LayoutDashboardIcon,
  ProfileIcon,
  LogoutIcon,
  PurchaseIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
  EllipsisIcon,
  MenuIcon,
} from "@/components/icons/Icons";
import { useAuth } from "../utils/hooks/auth";

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
};

export default function SideMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { isAuthenticated, userRole } = useAuth();

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

  const canAccessMenuItem = (role: String) => {
    if (user?.role === ROLES.ADMIN) return true;
    if (user?.role === ROLES.MANAGER) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.SALES) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.INVENTORY) return role !== ROLES.ADMIN;
    return false;
  };

  const imageSrc = user?.imagepath
    ? `${user.imagepath[0]}`
    : "/path/to/default/image.png";

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <div className="absolute h-screen flex flex-col lg:flex-row">
      <div
        className={`flex flex-col h-screen ${
          isMenuOpen ? "w-48" : "w-14"
        } lg:w-52 bg-white shadow-lg transition-all duration-300 ease-in-out`}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between p-4 border-b">
          <button className="lg:hidden text-gray-500" onClick={toggleMenu}>
            <MenuIcon className="w-4 h-4" />
          </button>
          <span className="text-lg font-semibold hidden lg:block">
            Point of Sale
          </span>
        </div>

        {/* Scrollable Links Area */}
        <div className="flex flex-col flex-grow overflow-hidden">
          <div
            className={`flex flex-col flex-grow overflow-auto lg:block ${
              isMenuOpen ? "block" : "hidden"
            }`}
          >
            <ScrollArea className="h-full">
              <nav className="mt-4 space-y-1 px-4">
                {canAccessMenuItem(ROLES.ADMIN) && (
                  <>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/dashboard"
                      prefetch={false}
                    >
                      <LayoutDashboardIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/product"
                      prefetch={false}
                    >
                      <BoxIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Product</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/sales"
                      prefetch={false}
                    >
                      <DollarSignIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/saleshistory"
                      prefetch={false}
                    >
                      <CalendarIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales History</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/purchase"
                      prefetch={false}
                    >
                      <PurchaseIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Purchase</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/purchasehistory"
                      prefetch={false}
                    >
                      <CalendarIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Purchase History</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/customer"
                      prefetch={false}
                    >
                      <UserIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Customer</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/supplier"
                      prefetch={false}
                    >
                      <TruckIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Supplier</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/user"
                      prefetch={false}
                    >
                      <UsersIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Users</span>
                    </Link>
                  </>
                )}
                {user?.role === ROLES.MANAGER && (
                  <>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/dashboard"
                      prefetch={false}
                    >
                      <LayoutDashboardIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/product"
                      prefetch={false}
                    >
                      <BoxIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Product</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/sales"
                      prefetch={false}
                    >
                      <DollarSignIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/saleshistory"
                      prefetch={false}
                    >
                      <CalendarIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales History</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/purchase"
                      prefetch={false}
                    >
                      <PurchaseIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Purchase</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/purchasehistory"
                      prefetch={false}
                    >
                      <CalendarIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Purchase History</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/customer"
                      prefetch={false}
                    >
                      <UserIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Customer</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/supplier"
                      prefetch={false}
                    >
                      <TruckIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Supplier</span>
                    </Link>
                  </>
                )}
                {user?.role === ROLES.SALES && (
                  <>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/sales"
                      prefetch={false}
                    >
                      <DollarSignIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/saleshistory"
                      prefetch={false}
                    >
                      <CalendarIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales History</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/customer"
                      prefetch={false}
                    >
                      <UserIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Customer</span>
                    </Link>
                  </>
                )}
                {user?.role === ROLES.INVENTORY && (
                  <>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/product"
                      prefetch={false}
                    >
                      <BoxIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Product</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      href="/supplier"
                      prefetch={false}
                    >
                      <TruckIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Supplier</span>
                    </Link>
                  </>
                )}
              </nav>
            </ScrollArea>
          </div>
          <div
            className={`bg-white border-t border-gray-200 flex items-center justify-between ${
              isMenuOpen ? "p-4" : "p-2"
            }  mt-auto`}
          >
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={user?.imagepath} />
                <AvatarFallback>{user?.firstname?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div
                className={`flex flex-col lg:flex ${
                  isMenuOpen ? "block" : "hidden"
                } lg:block`}
              >
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
                <Button variant="ghost" size="sm" className="ml-auto">
                  <EllipsisIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="w-full p-2 text-left text-sm text-gray-800 hover:bg-gray-100"
                    onClick={() => (window.location.href = "/profile")}
                  >
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
