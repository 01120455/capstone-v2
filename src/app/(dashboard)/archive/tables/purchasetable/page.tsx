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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function PurchaseTable({
  purchases,
  searchTerm,
  onRestore,
}: {
  purchases: TransactionTable[] | null;
  searchTerm: string;
  onRestore: (id: number) => void;
}) {
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionTable | null>(null);
  const filteredSales = purchases?.filter((purchases) =>
    // sales InvoiceNumber.invoicenumber or sales entity.name
    `${purchases.InvoiceNumber.invoicenumber} ${purchases.Entity.name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const totalPages = Math.ceil(filteredSales?.length ?? 0 / itemsPerPage);
  const paginatedSales = filteredSales?.slice(
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
      {selectedTransaction ? (
        <div className="bg-white dark:bg-gray-950 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Sales Details</h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSelectedTransaction(null)}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <div className="grid gap-1">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-1 p-2">
              <div className="font-medium text-muted-foreground">
                Invoice Number:
              </div>
              <div>{selectedTransaction.InvoiceNumber.invoicenumber}</div>
              <div className="font-medium text-muted-foreground">
                Customer Name:
              </div>
              <div>{selectedTransaction.Entity.name}</div>
              <div className="font-medium text-muted-foreground">
                Purchase Date:
              </div>
              <div>
                {selectedTransaction.createdat
                  ? new Date(selectedTransaction.createdat).toLocaleDateString(
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
              </div>
              <div className="font-medium text-muted-foreground">
                Sales Created by:
              </div>
              <div>
                {selectedTransaction.User
                  ? `${selectedTransaction.User.firstname} ${selectedTransaction.User.lastname}`
                  : "N/A"}
              </div>
            </div>
            <div className="overflow-y-auto">
              <div className="table-container relative ">
                <ScrollArea>
                  <Table>
                    <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                      <TableRow>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Item Type</TableHead>
                        <TableHead>Sack Weight</TableHead>
                        <TableHead>Unit of Measurement</TableHead>
                        <TableHead>Measurement Value</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Total Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedTransaction.TransactionItem.map(
                        (item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.Item.name}</TableCell>
                            <TableCell>{item.Item.type}</TableCell>
                            <TableCell>{item.Item.sackweight}</TableCell>
                            <TableCell>{item.unitofmeasurement}</TableCell>
                            <TableCell>{item.measurementvalue}</TableCell>
                            <TableCell>{formatPrice(item.unitprice)}</TableCell>
                            <TableCell>
                              {formatPrice(item.totalamount)}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            </div>
            <div className="grid grid-cols-2">
              <div className="font-medium">Total Items:</div>
              <div>{selectedTransaction.TransactionItem.length}</div>
              <div className="font-medium">
                Tax Amount {""} {selectedTransaction.taxpercentage}%:
              </div>
              <div>{formatPrice(selectedTransaction.taxamount ?? 0)}</div>
              <div className="font-medium">Total:</div>
              <div>{formatPrice(selectedTransaction.totalamount ?? 0)}</div>
            </div>
          </div>
        </div>
      ) : (
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
                {paginatedSales?.map(
                  (transaction: TransactionTable, index: number) => (
                    <TableRow
                      key={index}
                      className=" hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell>
                        {transaction.InvoiceNumber.invoicenumber}
                      </TableCell>
                      <TableCell>{transaction.Entity.name}</TableCell>
                      <TableCell>
                        {transaction.walkin ? "True" : "False"}
                      </TableCell>
                      <TableCell>
                        {transaction.frommilling ? "True" : "False"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`px-2 py-1 rounded-full ${
                            transaction.status === "paid"
                              ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                              : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100"
                              : transaction.status === "cancelled"
                              ? "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100" // Default case
                          }`}
                        >
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatPrice(transaction.totalamount ?? 0)}
                      </TableCell>
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
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <ArrowRightIcon className="h-6 w-6" />
                          <span className="sr-only">View details</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
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
      )}
    </div>
  );
}
