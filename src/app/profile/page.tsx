"use client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import SideMenu from "@/components/sidemenu";
import { useEffect, useState } from "react";
import { User } from "@/interfaces/user";

export default function Component() {
  const [user, setUser] = useState<User | null>(null);

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

  return (
    <div className="flex h-screen">
      <SideMenu />
      <div className="flex-1 overflow-y-auto p-8">
        <header className="flex flex-col sm:flex-row justify-start items-center mb-8">
          <div className="w-full">
            <div className="p-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src="/placeholder-user.jpg" />
                  <AvatarFallback>{user?.firstname?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <h2 className="text-4xl font-bold">
                    {user?.firstname && user?.middlename && user?.lastname
                      ? `${user.firstname} ${user.middlename} ${user.lastname}`
                      : "Guest"}
                  </h2>
                  <p className="text-xl text-muted-foreground">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row">
          <aside className="flex flex-col items-start p-4 space-y-4 mb-4 lg:mb-0">
            <div className="p-6 grid gap-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge
                    variant="secondary"
                    className={`px-2 py-1 rounded-full ${
                      user?.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                    }`}
                  >
                    {user?.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span>{user?.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Password:</span>
                  <span>********</span>
                </div>
              </div>
              <Separator />
              <div className="grid gap-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground">First Name:</span>
                  <span>{user?.firstname}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Middle Name:</span>
                  <span>{user?.middlename}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Name:</span>
                  <span>{user?.lastname}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span>{user?.role}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Inputs section */}
          <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-2">
            <div className="space-y-2 ml-10">
              <Label htmlFor="profilePicture">Profile Picture</Label>
              <Input id="profilePicture" type="file" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input id="middleName" defaultValue="" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="status">Status</Label>
              <Select defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
