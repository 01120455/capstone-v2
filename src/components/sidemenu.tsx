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
  ArchiveIcon,
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
    <div className="absolute z-40 h-screen flex flex-col lg:flex-row bg-customColors-ivoryWhite">
      <div
        className={`flex flex-col h-screen ${
          isMenuOpen ? "w-48" : "w-14"
        } lg:w-52 bg-CustomColors-ivoryWhite shadow-lg transition-all duration-300 ease-in-out`}
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
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/dashboard"
                      prefetch={false}
                    >
                      <LayoutDashboardIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/product"
                      prefetch={false}
                    >
                      <BoxIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Product</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/sales"
                      prefetch={false}
                    >
                      <DollarSignIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/saleshistory"
                      prefetch={false}
                    >
                      <CalendarIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales History</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/purchase"
                      prefetch={false}
                    >
                      <PurchaseIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Purchase</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/purchasehistory"
                      prefetch={false}
                    >
                      <CalendarIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Purchase History</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/user"
                      prefetch={false}
                    >
                      <UsersIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Users</span>
                    </Link>

                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/archive"
                      prefetch={false}
                    >
                      <ArchiveIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Archive</span>
                    </Link>
                  </>
                )}
                {user?.role === ROLES.MANAGER && (
                  <>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/dashboard"
                      prefetch={false}
                    >
                      <LayoutDashboardIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/product"
                      prefetch={false}
                    >
                      <BoxIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Product</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/sales"
                      prefetch={false}
                    >
                      <DollarSignIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/saleshistory"
                      prefetch={false}
                    >
                      <CalendarIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales History</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/purchase"
                      prefetch={false}
                    >
                      <PurchaseIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Purchase</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/purchasehistory"
                      prefetch={false}
                    >
                      <CalendarIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Purchase History</span>
                    </Link>
                  </>
                )}
                {user?.role === ROLES.SALES && (
                  <>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/sales"
                      prefetch={false}
                    >
                      <DollarSignIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales</span>
                    </Link>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/saleshistory"
                      prefetch={false}
                    >
                      <CalendarIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Sales History</span>
                    </Link>
                  </>
                )}
                {user?.role === ROLES.INVENTORY && (
                  <>
                    <Link
                      className="block p-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-customColors-mercury"
                      href="/product"
                      prefetch={false}
                    >
                      <BoxIcon className="inline-block w-4 h-4 mr-3" />
                      <span>Product</span>
                    </Link>
                  </>
                )}
              </nav>
            </ScrollArea>
          </div>
          <div
            className={`bg-customColors-ivoryWhite border-t border-gray-200 flex items-center justify-between ${
              isMenuOpen ? "p-4" : "pt-4 pb-4 pl-1"
            }  mt-auto`}
          >
            <div className="flex items-center space-x-3">
              <div className="pl-2 lg:pl-2">
                <Avatar>
                  <AvatarImage src={user?.imagepath} />
                  <AvatarFallback>{user?.firstname?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </div>
              <div
                className={`flex flex-col lg:flex ${
                  isMenuOpen ? "block" : "hidden"
                } lg:block`}
              >
                <span className="text-sm font-medium text-gray-800 text-customColors-darkKnight">
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
                <Button variant="ghost" size="icon">
                  <EllipsisIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="w-full p-2 text-left text-sm text-gray-800 rounded-xl hover:bg-customColors-mercury"
                    onClick={() => (window.location.href = "/profile")}
                  >
                    <ProfileIcon className="inline-block mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="w-full p-2 text-left text-sm text-gray-800 rounded-xl hover:bg-customColors-mercury"
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
