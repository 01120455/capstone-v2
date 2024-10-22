"use client";
import { RotateCcw, XIcon, ArrowRightIcon } from "@/components/icons/Icons";
import { Badge } from "@/components/ui/badge";
import Table, {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  TransactionItem,
  TransactionTable,
} from "@/schemas/transaction.schema";
import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface CombinedTransactionItem {
  documentNumber?: string;
  transactionitemid: number;
  transactionid: number;
  status: "pending" | "paid" | "cancelled";
  Item: {
    type: "bigas" | "palay" | "resico";
    name: string;
    sackweight: "bag25kg" | "cavan50kg";
    itemid?: number;
  };
  type: "purchases" | "sales";
  sackweight: "bag25kg" | "cavan50kg";
  unitofmeasurement: string;
  measurementvalue?: number;
  unitprice?: number;
  totalamount: number;
  lastmodifiedat?: Date;
  recentdelete: boolean | undefined;
}

export function PurchaseItemTable({
  purchases,
  searchTerm,
  onRestore,
}: {
  purchases: CombinedTransactionItem[] | null;
  searchTerm: string;
  onRestore: (id: number) => void;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(purchases?.length ?? 0 / itemsPerPage);
  const paginatedPurchases = purchases?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto">
        <div className="table-container relative ">
          <Table>
            <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
              <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
                <TableHead>Purchase Order No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead>Item Type</TableHead>
                <TableHead>Sack Weight</TableHead>
                <TableHead>Unit of Measurement</TableHead>
                <TableHead>Measurement Value</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPurchases?.map((purchaseItem) => (
                <TableRow
                  key={purchaseItem.transactionitemid}
                  className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                >
                  <TableCell>{purchaseItem.documentNumber}</TableCell>
                  <TableCell>
                    <Badge
                      className={`px-2 py-1 rounded-full ${
                        purchaseItem.status === "paid"
                          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                          : purchaseItem.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                          : purchaseItem.status === "cancelled"
                          ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" // Default case
                      }`}
                    >
                      {purchaseItem.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{purchaseItem.Item.name}</TableCell>
                  <TableCell>{purchaseItem.Item.type}</TableCell>
                  <TableCell>{purchaseItem.sackweight}</TableCell>
                  <TableCell>{purchaseItem.unitofmeasurement}</TableCell>
                  <TableCell>{purchaseItem.measurementvalue}</TableCell>
                  <TableCell>{purchaseItem.unitprice}</TableCell>
                  <TableCell>{formatPrice(purchaseItem.totalamount)}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestore(purchaseItem.transactionitemid)}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
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
        </div>
      </div>
    </div>
  );
}
