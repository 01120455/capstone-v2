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
  ChevronsUpDown,
  ChevronRightIcon,
  GalleryVerticalEnd,
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
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible } from "@radix-ui/react-collapsible";
import { CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";

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
  <Link href={href} prefetch={false} className="flex items-center">
    <Icon className="w-4 h-4 mr-3" />
    <span>{label}</span>
  </Link>
);

export default function SideMenu({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { isMobile } = useSidebar();
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
          <SidebarGroup>
            <SidebarGroupLabel>Overview</SidebarGroupLabel>
            <Link href="/dashboard">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Analytics">
                    <MenuItem
                      href="/dashboard"
                      icon={LayoutDashboardIcon}
                      label="Dashboard"
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </Link>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Inventory</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible
                key="Product"
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Product">
                      <MenuItem
                        href="/product"
                        icon={BoxIcon}
                        label="Product"
                      />
                      <ChevronRightIcon className="ml-auto mr-2 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem key="Product">
                        <SidebarMenuSubButton asChild>
                          <Link href="/product">
                            <span>Rice and By-products</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Sales</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible
                key="Sales"
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Sales">
                      <MenuItem
                        href="/sales"
                        icon={DollarSignIcon}
                        label="Sales"
                      />
                      <ChevronRightIcon className="ml-auto mr-2 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem key="Sales">
                        <SidebarMenuSubButton asChild>
                          <Link href="/sales">
                            <span>Point of Sale</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key="SalesHistory">
                        <SidebarMenuSubButton asChild>
                          <Link href="/saleshistory">
                            <span>Sales History</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key="SalesItems">
                        <SidebarMenuSubButton asChild>
                          <Link href="/salesitem">
                            <span>Sold Items</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Purchase</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible
                key="Purchase"
                asChild
                defaultOpen={false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Purchase">
                      <MenuItem
                        href="/purchase"
                        icon={PurchaseIcon}
                        label="Purchase"
                      />
                      <ChevronRightIcon className="ml-auto mr-2 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem key="Purchase">
                        <SidebarMenuSubButton asChild>
                          <Link href="/purchase">
                            <span>Purchase Order</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key="PurchaseHistory">
                        <SidebarMenuSubButton asChild>
                          <Link href="/purchasehistory">
                            <span>Purchase Order History</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key="PurchasedItemsFromMilling">
                        <SidebarMenuSubButton asChild>
                          <Link href="/purchaseditemsfrommilling">
                            <span>Milling Purchased Items</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key="PurchasedItemsnonmilling">
                        <SidebarMenuSubButton asChild>
                          <Link href="/purchaseditemsnonmilling">
                            <span>Non-Milling Purchased Items</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>

          {user.role === ROLES.ADMIN && (
            <>
              <SidebarGroup>
                <Link href="/user">
                  <SidebarGroupLabel>User Management</SidebarGroupLabel>
                  <SidebarMenu>
                    <Collapsible
                      key="User"
                      asChild
                      defaultOpen={false}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton tooltip="User">
                            <MenuItem
                              href="/user"
                              icon={UsersIcon}
                              label="Users"
                            />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                      </SidebarMenuItem>
                    </Collapsible>
                  </SidebarMenu>
                </Link>
              </SidebarGroup>
            </>
          )}
        </>
      );
    }

    if (user.role === ROLES.SALES) {
      return (
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Sales</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible
                key="Sales"
                asChild
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Sales">
                      <MenuItem
                        href="/sales"
                        icon={DollarSignIcon}
                        label="Sales"
                      />
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem key="Sales">
                        <SidebarMenuSubButton asChild>
                          <Link href="/sales">
                            <span>Point of Sale</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key="SalesHistory">
                        <SidebarMenuSubButton asChild>
                          <Link href="/saleshistory">
                            <span>Sales History</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key="SalesItems">
                        <SidebarMenuSubButton asChild>
                          <Link href="/salesitem">
                            <span>Sales Items</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        </>
      );
    }

    if (user.role === ROLES.INVENTORY) {
      return (
        <>
          <SidebarGroup>
            <SidebarGroupLabel>Inventory</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible
                key="Product"
                asChild
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Product">
                      <MenuItem
                        href="/product"
                        icon={BoxIcon}
                        label="Product"
                      />
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem key="Product">
                        <SidebarMenuSubButton asChild>
                          <Link href="/product">
                            <span>Rice and By-products</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>Transaction History</SidebarGroupLabel>
            <SidebarMenu>
              <Collapsible
                key="Transactions"
                asChild
                defaultOpen={true}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Transactions">
                      <MenuItem
                        href="/saleshistory"
                        icon={DollarSignIcon}
                        label="Transactions"
                      />
                      <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem key="SalesHistory">
                        <SidebarMenuSubButton asChild>
                          <Link href="/saleshistory">
                            <span>Sales History</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key="SalesItems">
                        <SidebarMenuSubButton asChild>
                          <Link href="/salesitem">
                            <span>Sales Items</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key="PurchaseOrderHistory">
                        <SidebarMenuSubButton asChild>
                          <Link href="/purchasehistory">
                            <span>Purchase Order History</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem key="PurchasedItemsFromMilling">
                        <SidebarMenuSubButton asChild>
                          <Link href="/purchaseditemsfrommilling">
                            <span>Purchased Items from Milling</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        </>
      );
    }

    return null;
  }, [user]);

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex  aspect-square size-8 items-center justify-center rounded-lg bg-customColors-eveningSeaGreen text-customColors-offWhite">
                  <GalleryVerticalEnd className="size-6" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-customColors-eveningSeaGreen">
                    3R Shane Rice Mill IMS
                  </span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* <div className="flex items-center justify-between">
          <span className="text-lg font-semibold block">3R Shane IMS</span>
        </div> */}
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">{menuItems}</ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.imagepath} />
                  <AvatarFallback className="rounded-lg">
                    {user?.firstname?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {user?.firstname && user?.lastname
                      ? `${user.firstname} ${user.lastname}`
                      : "Guest"}
                  </span>
                  <span className="truncate text-xs">
                    {user?.email || "guest"}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
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
