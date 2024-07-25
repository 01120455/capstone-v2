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

export default function Component() {
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
                  <AvatarFallback>JP</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <h2 className="text-4xl font-bold">Bain Hansly Repato</h2>
                  <p className="text-xl text-muted-foreground">Admin</p>
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
                    className="bg-green-500 text-green-50"
                  >
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Username:</span>
                  <span>Bain27</span>
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
                  <span>Bain Hansly</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Middle Name:</span>
                  <span>Cruz</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Name:</span>
                  <span>Repato</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Role:</span>
                  <span>Admin</span>
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
              <Input id="firstName" defaultValue="Bain Hansly" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input id="middleName" defaultValue="Cruz" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="Repato" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue="admin">
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
              <Select defaultValue="active">
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
              <Input id="username" defaultValue="johndoe" />
            </div>
            <div className="space-y-2 ml-10">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" defaultValue="password123" />
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
