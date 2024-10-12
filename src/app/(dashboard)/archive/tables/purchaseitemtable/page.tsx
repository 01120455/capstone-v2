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
import { TransactionTable } from "@/schemas/transaction.schema";
import { useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function PurchaseItemTable({
  purchases,
  searchTerm,
  onRestore,
}: {
  purchases: TransactionTable[] | null;
  searchTerm: string;
  onRestore: (id: number) => void;
}) {
  const filteredPurchases = purchases?.filter((purchases) =>
    `${purchases.InvoiceNumber.invoicenumber} ${purchases.Entity.name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(filteredPurchases?.length ?? 0 / itemsPerPage);
  const paginatedPurchases = filteredPurchases?.slice(
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
              <TableRow>
                <TableHead>Invoice No.</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Walk-in</TableHead>
                <TableHead>From Milling</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPurchases?.flatMap((transaction) =>
                transaction.TransactionItem.map((item) => (
                  <TableRow
                    key={item.transactionitemid}
                    className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell>
                      {transaction.InvoiceNumber.invoicenumber}
                    </TableCell>
                    <TableCell>{transaction.Entity.name}</TableCell>
                    <TableCell>{item.Item.name}</TableCell>
                    <TableCell>{formatPrice(item.unitprice)}</TableCell>
                    <TableCell>{formatPrice(item.totalamount)}</TableCell>
                    <TableCell>
                      {transaction.createdat
                        ? new Date(transaction.createdat).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRestore(transaction.transactionid)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="flex items-center justify-center mt-2">
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
