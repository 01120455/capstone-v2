"use client";

import { useState, useCallback, useMemo, useContext } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/utils/hooks/auth";
import {
  BoxIcon,
  CalendarIcon,
  DollarSignIcon,
  LayoutDashboardIcon,
  ProfileIcon,
  LogoutIcon,
  PurchaseIcon,
  UsersIcon,
  EllipsisIcon,
  MenuIcon,
  ArchiveIcon,
} from "@/components/icons/Icons";
import { userSessionContext } from "@/components/sessionContext-provider";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
};

const MenuItem = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild>
      <Link href={href} prefetch={false} className="flex items-center">
        <Icon className="w-4 h-4 mr-3" />
        <span>{label}</span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
);

export default function SideMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const user = useContext(userSessionContext);
  const { isAuthenticated, userRole } = useAuth();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen((prev) => !prev);
  }, []);

  const logout = useCallback(async () => {
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
  }, []);

  const menuItems = useMemo(() => {
    if (!user) return null;

    if (user.role === ROLES.ADMIN || user.role === ROLES.MANAGER) {
      return (
        <>
          <MenuItem
            href="/dashboard"
            icon={LayoutDashboardIcon}
            label="Dashboard"
          />
          <MenuItem href="/product" icon={BoxIcon} label="Product" />
          <MenuItem href="/sales" icon={DollarSignIcon} label="Sales" />
          <MenuItem
            href="/saleshistory"
            icon={CalendarIcon}
            label="Sales History"
          />
          <MenuItem href="/purchase" icon={PurchaseIcon} label="Purchase" />
          <MenuItem
            href="/purchasehistory"
            icon={CalendarIcon}
            label="Purchase History"
          />
          {user.role === ROLES.ADMIN && (
            <>
              <MenuItem href="/user" icon={UsersIcon} label="Users" />
              {/* <MenuItem href="/archive" icon={ArchiveIcon} label="Archive" /> */}
            </>
          )}
        </>
      );
    }

    if (user.role === ROLES.SALES) {
      return (
        <>
          <MenuItem href="/sales" icon={DollarSignIcon} label="Sales" />
          <MenuItem
            href="/saleshistory"
            icon={CalendarIcon}
            label="Sales History"
          />
        </>
      );
    }

    if (user.role === ROLES.INVENTORY) {
      return (
        <>
          <MenuItem href="/product" icon={BoxIcon} label="Product" />
          <MenuItem
            href="/saleshistory"
            icon={CalendarIcon}
            label="Sales History"
          />
          <MenuItem
            href="/purchasehistory"
            icon={CalendarIcon}
            label="Purchase History"
          />
        </>
      );
    }

    return null;
  }, [user]);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Sidebar collapsible="offcanvas" variant="sidebar">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold block">3R Shane IMS</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <SidebarMenu>{menuItems}</SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user?.imagepath} />
              <AvatarFallback>{user?.firstname?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">
                {user?.firstname && user?.lastname
                  ? `${user.firstname} ${user.lastname}`
                  : "Guest"}
              </span>
              <span className="text-xs text-muted-foreground">
                {user?.email || "guest"}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <EllipsisIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onSelect={() => (window.location.href = "/profile")}
                >
                  <ProfileIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={logout}>
                  <LogoutIcon className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
