import { FilterIcon, RotateCcw } from "@/components/icons/Icons";
import { Badge } from "@/components/ui/badge";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddUser } from "@/schemas/User.schema";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface UserTableProps {
  users: AddUser[] | null;
  onRestore: (id: number, type: string) => void;
  filters: any; // Add this line
  setFilters: (filters: any) => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  clearFilters: () => void;
}

type UserFilters = {
  username: string;
  firstname: string;
  middlename: string;
  lastname: string;
  role: string;
  status: string;
};

export function UserTable({
  users,
  onRestore,
  filters, // Add this line
  setFilters,
  currentPage,
  totalPages,
  handlePageChange,
  clearFilters,
}: UserTableProps) {
  const filteredUsers = useMemo(() => {
    return users;
  }, [users]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev: UserFilters) => ({ ...prev, username: value }));
    handlePageChange(1);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev: UserFilters) => ({ ...prev, firstname: value }));
    handlePageChange(1);
  };

  const handleMiddleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev: UserFilters) => ({ ...prev, middlename: value }));
    handlePageChange(1);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev: UserFilters) => ({ ...prev, lastname: value }));
    handlePageChange(1);
  };

  const handleUserRoleChange = (value: string) => {
    setFilters((prev: UserFilters) => ({ ...prev, role: value }));
    handlePageChange(1);
  };

  const handleUserStatusChange = (value: string) => {
    setFilters((prev: UserFilters) => ({ ...prev, status: value }));
    handlePageChange(1);
  };

  const renderFilters = () => (
    <Popover>
      <PopoverTrigger>
        <FilterIcon className="w-6 h-6" />
      </PopoverTrigger>
      <PopoverContent className="bg-customColors-offWhite rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">Filters</h2>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
          <div className="grid gap-2">
            <span className="text-sm">User First Name</span>
            <Input
              id="name"
              type="text"
              placeholder="Search user's first name..."
              value={filters.firstname}
              onChange={handleFirstNameChange}
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm">User Middle Name</span>
            <Input
              id="name"
              type="text"
              placeholder="Search user's middle name..."
              value={filters.middlename}
              onChange={handleMiddleNameChange}
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm">User Last Name</span>
            <Input
              id="name"
              type="text"
              placeholder="Search user's last name..."
              value={filters.lastname}
              onChange={handleLastNameChange}
            />
          </div>
          <div className="grid gap-2">
            <span className="text-sm">User Role</span>
            <Select value={filters.role} onValueChange={handleUserRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select user's role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <span className="text-sm">User Status</span>
            <Select
              value={filters.status}
              onValueChange={handleUserStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user's status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Input
            type="text"
            placeholder="Search by username..."
            value={filters.username}
            onChange={handleUsernameChange}
            className="w-full md:w-auto"
          />
          <div className="flex gap-2">{renderFilters()}</div>
        </div>
      </div>
      <ScrollArea>
        <Table>
          <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
            <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.map((user, index) => (
              <TableRow key={index}>
                <TableCell>{`${user.firstname} ${user.middlename || ""} ${
                  user.lastname
                }`}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRestore(user.userid ?? 0, "user")}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      <div className="flex items-center justify-center mt-4">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => handlePageChange(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}
