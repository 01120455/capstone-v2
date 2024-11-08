"use client";

import React, { useMemo } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FilterIcon } from "@/components/icons/Icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CombinedTransactionItem {
  documentNumber?: string;
  transactionitemid: number;
  transactionid: number;
  frommilling: boolean;
  status: "pending" | "paid" | "cancelled";
  Item: {
    itemtype: "bigas" | "palay" | "resico";
    itemname: string;
    sackweight: "bag25kg" | "cavan50kg";
    itemid?: number;
  };
  transactiontype: "purchases" | "sales";
  sackweight: "bag25kg" | "cavan50kg";
  unitofmeasurement: string;
  stock: number;
  unitprice: number;
  totalamount: number;
  lastmodifiedat?: Date;
}

interface Filters {
  purordno: string;
  name: string;
  type: string;
  status: string;
  dateRange: { start: string; end: string };
}

interface PurchaseItemsTableProps {
  transactionItems: CombinedTransactionItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  clearFilters: () => void;
  userRole: string;
}

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
} as const;

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const formatStock = (stock: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(stock);
};

function PurchaseItemsTable({
  transactionItems,
  currentPage,
  totalPages,
  onPageChange,
  filters,
  setFilters,
  clearFilters,
  userRole,
}: PurchaseItemsTableProps) {
  const filteredTransactionItems = useMemo(
    () => transactionItems,
    [transactionItems]
  );

  const canAccessButton = (role: string) => {
    if (userRole === ROLES.ADMIN) return true;
    if (userRole === ROLES.MANAGER) return role !== ROLES.ADMIN;
    if (userRole === ROLES.SALES) return role !== ROLES.ADMIN;
    if (userRole === ROLES.INVENTORY) return role !== ROLES.ADMIN;
    return false;
  };

  const handlePurchaseOrderChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, purordno: value }));
  };

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, name: value }));
  };

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value }));
  };

  const handleItemTypeChange = (value: string) => {
    setFilters((prev) => ({ ...prev, type: value }));
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
            <Label htmlFor="document-number">Purchase Order No.</Label>
            <Input
              id="document-number"
              type="text"
              placeholder="Enter Purchase Order No."
              value={filters.purordno}
              onChange={handlePurchaseOrderChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="item-name">Item Name</Label>
            <Input
              id="item-name"
              type="text"
              placeholder="Enter Item name"
              value={filters.name}
              onChange={handleItemNameChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="item-type">Item Type</Label>
            <Select value={filters.type} onValueChange={handleItemTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="palay">Palay</SelectItem>
                <SelectItem value="bigas">Bigas</SelectItem>
                <SelectItem value="resico">Resico</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.dateRange.start}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    start: e.target.value,
                  },
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.dateRange.end}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    end: e.target.value,
                  },
                }))
              }
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-4 mb-4">{renderFilters()}</div>
      </div>
      <div className="table-container relative">
        <Table className="min-w-[600px] rounded-md border-border w-full h-10 overflow-clip relative bg-customColors-beigePaper">
          <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
            <TableRow className="bg-customColors-screenLightGreen hover:bg-customColors-screenLightGreen">
              <TableHead>Purchase Order No.</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Item Name</TableHead>
              <TableHead>Item Type</TableHead>
              <TableHead>Sack Weight</TableHead>
              <TableHead>Unit of Measurement</TableHead>
              <TableHead>Stock</TableHead>
              {canAccessButton(ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES) && (
                <>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Total Amount</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactionItems.map((purchaseItem) => (
              <TableRow
                key={purchaseItem.transactionitemid}
                className="hover:bg-customColors-screenLightGreen"
              >
                <TableCell>{purchaseItem.documentNumber}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      purchaseItem.status === "paid"
                        ? "default"
                        : purchaseItem.status === "pending"
                        ? "secondary"
                        : purchaseItem.status === "cancelled"
                        ? "destructive"
                        : "outline"
                    }
                    className={`px-2 py-1 rounded-full ${
                      purchaseItem.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : purchaseItem.status === "pending"
                        ? "bg-yellow-100 text-yellow-800 "
                        : purchaseItem.status === "cancelled"
                        ? "bg-red-100 text-red-800 "
                        : "bg-gray-100 text-gray-800 "
                    }`}
                  >
                    {purchaseItem.status}
                  </Badge>
                </TableCell>
                <TableCell>{purchaseItem.Item.itemname}</TableCell>
                <TableCell>{purchaseItem.Item.itemtype}</TableCell>
                <TableCell>{purchaseItem.sackweight}</TableCell>
                <TableCell>{purchaseItem.unitofmeasurement}</TableCell>
                <TableCell>{formatStock(purchaseItem.stock)}</TableCell>
                {canAccessButton(ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES) && (
                  <>
                    <TableCell>{formatPrice(purchaseItem.unitprice)}</TableCell>
                    <TableCell>{formatPrice(purchaseItem.totalamount)}</TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
        <div className="flex items-center justify-center mt-4 mb-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="hover:bg-customColors-beigePaper"
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    className="hover:bg-customColors-beigePaper"
                    onClick={() => onPageChange(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  className="hover:bg-customColors-beigePaper"
                  onClick={() =>
                    onPageChange(Math.min(totalPages, currentPage + 1))
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}

export default PurchaseItemsTable;