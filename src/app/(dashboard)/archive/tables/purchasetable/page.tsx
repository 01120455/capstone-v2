import {
  RotateCcw,
  XIcon,
  ArrowRightIcon,
  FilterIcon,
} from "@/components/icons/Icons";
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
import { useMemo, useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
    type: "bigas" | "palay" | "resico";
    name: string;
    sackweight: "bag25kg" | "cavan50kg";
    itemid?: number;
  };
  type: "purchases" | "sales";
  sackweight: "bag25kg" | "cavan50kg";
  unitofmeasurement: string;
  stock?: number;
  unitprice?: number;
  totalamount: number;
  lastmodifiedat?: Date;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

interface PurchaseTableProps {
  purchases: TransactionTable[] | null;
  onRestore: (id: number, type: string) => void;
  filters: any; // Add this line
  setFilters: (filters: any) => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  clearFilters: () => void;
  transactionItem: CombinedTransactionItem[] | null;
  currentTransactionItemsPage: number;
  totalTransactionItemsPages: number;
  handleTransactionItemsPageChange: (page: number) => void;
  filters2: any;
  setFilters2: (filters: any) => void;
  clearFilters2: () => void;
}

type PurchaseFilters = {
  purordno: "";
  name: "";
  frommilling: "";
  status: "";
  dateRange: { start: ""; end: "" };
};

export function PurchaseTable({
  purchases,
  onRestore,
  filters,
  setFilters,
  currentPage,
  totalPages,
  handlePageChange,
  clearFilters,
  transactionItem,
  handleTransactionItemsPageChange,
  currentTransactionItemsPage,
  totalTransactionItemsPages,
  filters2,
  setFilters2,
  clearFilters2,
}: PurchaseTableProps) {
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionTable | null>(null);

  const handlePurchaseOrderChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFilters((prev: PurchaseFilters) => ({ ...prev, purordno: value }));
    // setFilters2((prev: PurchaseFilters) => ({ ...prev, purordno: value }));
    handlePageChange(1);
    // handleTransactionItemsPageChange(1);
  };

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev: PurchaseFilters) => ({ ...prev, name: value }));
    // setFilters2((prev: PurchaseFilters) => ({ ...prev, name: value }));
    handlePageChange(1);
    // handleTransactionItemsPageChange(1);
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
            <Button onClick={clearAllFilters}>Clear Filters</Button>
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
            <Label htmlFor="frommilling">From Milling</Label>
            <Select
              value={filters.frommilling}
              onValueChange={handleFromMillingChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </SelectTrigger>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={filters.dateRange.start}
              onChange={(e) => {
                const newValue = e.target.value;

                setFilters((prev: PurchaseFilters) => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    start: newValue,
                  },
                }));

                setFilters2((prev: PurchaseFilters) => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    start: newValue,
                  },
                }));
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={filters.dateRange.end}
              onChange={(e) => {
                const newValue = e.target.value;

                setFilters((prev: PurchaseFilters) => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    end: newValue,
                  },
                }));

                setFilters2((prev: PurchaseFilters) => ({
                  ...prev,
                  dateRange: {
                    ...prev.dateRange,
                    end: newValue,
                  },
                }));
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  const handleStatusChange = (value: string) => {
    setFilters((prev: PurchaseFilters) => ({
      ...prev,
      status: value,
    }));
    // setFilters2((prev: PurchaseFilters) => ({ ...prev, status: value }));
    handlePageChange(1);
    // handleTransactionItemsPageChange(1);
  };

  const handleFromMillingChange = (value: string) => {
    setFilters((prev: PurchaseFilters) => ({
      ...prev,
      frommilling: value,
    }));
    handlePageChange(1);
  };

  const clearAllFilters = () => {
    clearFilters();
    // clearFilters2();
    handlePageChange(1);
    // handleTransactionItemsPageChange(1);
  };

  const filteredPurchases = useMemo(() => {
    return purchases;
  }, [purchases]);

  const filteredTransactionItems = useMemo(() => {
    return transactionItem;
  }, [transactionItem]);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <Input
          type="text"
          placeholder="Search purchase order no. ..."
          value={filters.name}
          onChange={handleItemNameChange}
          className="w-full md:w-auto"
        />
        <div className="flex flex-row gap-2">{renderFilters()}</div>
      </div>
      <div className="flex flex-col gap-6">
        {selectedTransaction ? (
          <div className="bg-customColors-offWhite rounded-lg shadow-lg p-6">
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
                <div>{selectedTransaction.DocumentNumber.documentnumber}</div>
                <div className="font-medium text-muted-foreground">
                  Purchase Date:
                </div>
                <div>
                  {selectedTransaction.createdat
                    ? new Date(
                        selectedTransaction.createdat
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
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
                        <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
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
                              <TableCell>{item.stock}</TableCell>
                              <TableCell>
                                {formatPrice(item.unitprice)}
                              </TableCell>
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
                <div className="font-medium">Total:</div>
                <div>{formatPrice(selectedTransaction.totalamount ?? 0)}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="table-container relative ">
              <ScrollArea>
                <Table>
                  <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                    <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
                      <TableHead>Invoice No.</TableHead>
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
                    {filteredPurchases?.map(
                      (transaction: TransactionTable, index: number) => (
                        <TableRow
                          key={index}
                          className=" hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                        >
                          <TableCell>
                            {transaction.DocumentNumber.documentnumber}
                          </TableCell>
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
                              ? new Date(
                                  transaction.createdat
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onRestore(transaction.transactionid, "purchase")
                              }
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setSelectedTransaction(transaction)
                              }
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
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
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
                          handlePageChange(
                            Math.min(totalPages, currentPage + 1)
                          )
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
      <div className="flex  items-center justify-between mb-6 -mr-6 pt-6">
        <h1 className="text-2xl font-bold ">
          List of Purchase Items from Milling
        </h1>
      </div>
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
                {filteredTransactionItems?.map((purchaseItem) => (
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
                    <TableCell>{purchaseItem.stock}</TableCell>
                    <TableCell>{purchaseItem.unitprice}</TableCell>
                    <TableCell>
                      {formatPrice(purchaseItem.totalamount)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onRestore(
                            purchaseItem.transactionitemid,
                            "purchaseItem"
                          )
                        }
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
                        handleTransactionItemsPageChange(
                          Math.max(1, currentTransactionItemsPage - 1)
                        )
                      }
                    />
                  </PaginationItem>
                  {[...Array(totalTransactionItemsPages)].map((_, index) => (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() =>
                          handleTransactionItemsPageChange(index + 1)
                        }
                        isActive={currentTransactionItemsPage === index + 1}
                      >
                        {index + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handleTransactionItemsPageChange(
                          Math.min(
                            totalTransactionItemsPages,
                            currentTransactionItemsPage + 1
                          )
                        )
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
