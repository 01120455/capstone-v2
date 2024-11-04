"use client";

import {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  TransactionItem,
  TransactionTable,
} from "@/schemas/transaction.schema";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { XIcon, ArrowRightIcon, FilterIcon } from "@/components/icons/Icons";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User } from "@/interfaces/user";
import { userSessionContext } from "@/components/sessionContext-provider";

const ROLES = {
  SALES: "sales",
  INVENTORY: "inventory",
  MANAGER: "manager",
  ADMIN: "admin",
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
};

const ROWS_PER_PAGE = 10;

const useFilters = () => {
  const [filters, setFilters] = useState({
    purordno: "",
    name: "",
    frommilling: "",
    status: "",
    dateRange: { start: "", end: "" },
  });

  const clear = () => {
    setFilters({
      purordno: "",
      name: "",
      frommilling: "",
      status: "",
      dateRange: { start: "", end: "" },
    });
  };

  return {
    filters,
    setFilters,
    clear,
  };
};

const usePurchases = () => {
  const { filters, setFilters, clear } = useFilters();
  const [purchases, setPurchases] = useState<TransactionTable[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const fetchPurchases = useCallback(
    async (page: number) => {
      if (isNaN(page) || page < 1) return;

      try {
        const params = new URLSearchParams({
          limit: ROWS_PER_PAGE.toString(),
          page: page.toString(),
        });

        if (filters.purordno) {
          params.append("documentnumber", filters.purordno);
        }
        if (filters.name) {
          params.append("name", filters.name);
        }
        if (filters.frommilling) {
          params.append("frommilling", filters.frommilling);
        }
        if (filters.status) {
          params.append("status", filters.status);
        }
        if (filters.dateRange.start) {
          params.append("startdate", filters.dateRange.start);
        }
        if (filters.dateRange.end) {
          params.append("enddate", filters.dateRange.end);
        }

        const response = await fetch(
          `/api/purchase/purchasepagination?${params}`
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setPurchases(data);

        const totalPurchasesResponse = await fetch(`/api/purchase`);
        const totalRowsData = await totalPurchasesResponse.json();
        setTotalPages(Math.ceil(totalRowsData.length / ROWS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching purchases:", error);
      }
    },
    [filters]
  );

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const shouldDebounce = filters.purordno || filters.name;

    if (shouldDebounce) {
      const timer = setTimeout(() => fetchPurchases(currentPage), 2000);
      setDebounceTimeout(timer);
    } else {
      fetchPurchases(currentPage);
    }

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [filters.purordno, filters.name, currentPage, fetchPurchases]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    clear();
    fetchPurchases(1);
  };

  return {
    purchases,
    currentPage,
    totalPages,
    handlePageChange,
    filters,
    setFilters,
    clearFilters,
  };
};

export default function Component() {
  const user = useContext(userSessionContext);
  const {
    purchases,
    currentPage,
    totalPages,
    handlePageChange,
    filters,
    setFilters,
    clearFilters,
  } = usePurchases();
  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionTable | null>(null);

  const filteredTransactions = useMemo(() => {
    return purchases;
  }, [purchases]);

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

  const clearAllFilters = () => {
    clearFilters();
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

                setFilters((prev) => ({
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

                setFilters((prev) => ({
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
    setFilters((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleFromMillingChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      frommilling: value,
    }));
  };

  const canAccessButton = (role: String) => {
    if (user?.role === ROLES.ADMIN) return true;
    if (user?.role === ROLES.MANAGER) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.SALES) return role !== ROLES.ADMIN;
    if (user?.role === ROLES.INVENTORY) return role !== ROLES.ADMIN;
    return false;
  };

  const downloadPurchaseOrder = async () => {
    const response = await fetch("/api/generatepurchaseorder", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transactionId: selectedTransaction?.transactionid,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } else {
      console.error("Failed to generate purchase order");
    }
  };

  const formatStock = (stock: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(stock);
  };

  return (
    <div className="flex min-h-screen w-full bg-customColors-lightPastelGreen">
      <div className="flex-1 overflow-y-auto pl-6 pr-6 w-full">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <h1 className="text-2xl font-bold mb-6 text-customColors-eveningSeaGreen">
            Purchase Order History
          </h1>
          <div className="grid gap-6 grid-cols-1">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4"></div>
              {selectedTransaction ? (
                <div className="bg-customColors-offWhite rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-customColors-eveningSeaGreen">
                      Purchase Order Details
                    </h2>
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
                        Created by:
                      </div>
                      <div>
                        {selectedTransaction.createdbyuser
                          ? `${selectedTransaction.createdbyuser.firstname} ${selectedTransaction.createdbyuser.lastname}`
                          : "N/A"}
                      </div>
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
                        Updated by:
                      </div>
                      <div>
                        {selectedTransaction.lastmodifiedbyuser
                          ? `${selectedTransaction.lastmodifiedbyuser.firstname} ${selectedTransaction.lastmodifiedbyuser.lastname}`
                          : "N/A"}
                      </div>
                      <div className="font-medium text-muted-foreground">
                        Updated at:
                      </div>
                      <div>
                        {selectedTransaction.lastmodifiedat
                          ? new Date(
                              selectedTransaction.lastmodifiedat
                            ).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </div>
                    </div>
                    <div className="overflow-y-auto">
                      <div className="table-container relative ">
                        <ScrollArea>
                          <Table
                            style={{ width: "100%" }}
                            className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative"
                            divClassname="min-h-[200px] overflow-y-scroll max-h-[200px] overflow-y-auto"
                          >
                            <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md ">
                              <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
                                <TableHead>Item Name</TableHead>
                                <TableHead>Item Type</TableHead>
                                <TableHead>Sack Weight</TableHead>
                                <TableHead>Unit of Measurement</TableHead>
                                <TableHead>Stock</TableHead>
                                {canAccessButton(
                                  ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                                ) && (
                                  <>
                                    <TableHead>Unit Price</TableHead>
                                    <TableHead>Total Amount</TableHead>
                                  </>
                                )}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {selectedTransaction.TransactionItem.map(
                                (item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{item.Item.itemname}</TableCell>
                                    <TableCell>{item.Item.itemtype}</TableCell>
                                    <TableCell>{item.sackweight}</TableCell>
                                    <TableCell>
                                      {item.unitofmeasurement}
                                    </TableCell>
                                    <TableCell>
                                      {formatStock(item.stock)}
                                    </TableCell>
                                    {canAccessButton(
                                      ROLES.ADMIN ||
                                        ROLES.MANAGER ||
                                        ROLES.SALES
                                    ) && (
                                      <>
                                        <TableCell>
                                          {formatPrice(item.unitprice)}
                                        </TableCell>
                                        <TableCell>
                                          {formatPrice(item.totalamount)}
                                        </TableCell>
                                      </>
                                    )}
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                          <ScrollBar orientation="horizontal" />
                        </ScrollArea>
                      </div>
                    </div>
                    <div className="grid grid-cols-1">
                      <div className="font-medium text-customColors-eveningSeaGreen">
                        Total Items:{" "}
                        {selectedTransaction.TransactionItem.length}
                      </div>
                      {canAccessButton(
                        ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                      ) && (
                        <>
                          <div className="font-medium text-customColors-eveningSeaGreen">
                            Total:{" "}
                            {formatPrice(selectedTransaction.totalamount ?? 0)}
                          </div>
                        </>
                      )}
                      {canAccessButton(
                        ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                      ) && (
                        <>
                          <Button
                            onClick={downloadPurchaseOrder}
                            className="mt-4 text-white py-2 px-4 rounded"
                          >
                            Download Document
                          </Button>
                        </>
                      )}
                    </div>
                    {/* <div className="flex justify-end space-x-2">
                      <Button variant={"secondary"}>
                        <Pencil className="h-4 w-4 mr-2" />
                        <span className="sr-only">Edit Transaction</span>
                      </Button>
                      <Button variant={"destructive"}>
                        <Bin className="h-4 w-4 mr-2" />
                        <span className="sr-only">Delete Transaction</span>
                      </Button>
                    </div> */}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex items-center justify-end">
                    <div className="flex items-center gap-4 mb-4">
                      {renderFilters()}
                    </div>
                  </div>
                  <div className="table-container relative ">
                    <ScrollArea>
                      <Table
                        style={{ width: "100%" }}
                        className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative bg-customColors-beigePaper"
                        // divClassname="min-h-[300px] overflow-y-scroll max-h-[400px] lg:max-h-[600px] xl:max-h-[800px] overflow-y-auto rounded-md"
                      >
                        <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                          <TableRow className="bg-customColors-screenLightGreen hover:bg-customColors-screenLightGreen">
                            <TableHead>Purchase Order No.</TableHead>
                            <TableHead>From Milling</TableHead>
                            <TableHead>Status</TableHead>
                            {canAccessButton(
                              ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                            ) && (
                              <>
                                <TableHead>Total Amount</TableHead>
                              </>
                            )}
                            <TableHead>Date</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredTransactions.length > 0 ? (
                            filteredTransactions.map(
                              (
                                transaction: TransactionTable,
                                index: number
                              ) => (
                                <TableRow
                                  key={index}
                                  onClick={() =>
                                    setSelectedTransaction(transaction)
                                  }
                                  className="hover:bg-customColors-screenLightGreen"
                                >
                                  <TableCell>
                                    {transaction.DocumentNumber.documentnumber}
                                  </TableCell>
                                  <TableCell>
                                    {transaction.frommilling ? "Yes" : "No"}
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
                                  {canAccessButton(
                                    ROLES.ADMIN || ROLES.MANAGER || ROLES.SALES
                                  ) && (
                                    <>
                                      <TableCell>
                                        {formatPrice(
                                          transaction.totalamount ?? 0
                                        )}
                                      </TableCell>
                                    </>
                                  )}
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
                                    <Button variant="ghost" size="icon">
                                      <ArrowRightIcon className="h-6 w-6" />
                                      <span className="sr-only">
                                        View details
                                      </span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              )
                            )
                          ) : (
                            <TableRow>
                              <TableCell colSpan={8} className="text-center">
                                No transactions found.
                              </TableCell>
                            </TableRow>
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
                              className="hover:bg-customColors-beigePaper"
                              onClick={() =>
                                handlePageChange(Math.max(1, currentPage - 1))
                              }
                            />
                          </PaginationItem>
                          {currentPage > 3 && (
                            <>
                              <PaginationItem>
                                <PaginationLink
                                  className="hover:bg-customColors-beigePaper"
                                  onClick={() => handlePageChange(1)}
                                  isActive={currentPage === 1}
                                >
                                  1
                                </PaginationLink>
                              </PaginationItem>
                              {currentPage > 3 && <PaginationEllipsis />}
                            </>
                          )}

                          {Array.from(
                            { length: Math.min(3, totalPages) },
                            (_, index) => {
                              const pageIndex =
                                Math.max(1, currentPage - 1) + index;
                              if (pageIndex < 1 || pageIndex > totalPages)
                                return null;

                              return (
                                <PaginationItem key={pageIndex}>
                                  <PaginationLink
                                    className="hover:bg-customColors-beigePaper"
                                    onClick={() => handlePageChange(pageIndex)}
                                    isActive={currentPage === pageIndex}
                                  >
                                    {pageIndex}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            }
                          )}

                          {currentPage < totalPages - 2 && (
                            <>
                              {currentPage < totalPages - 3 && (
                                <PaginationEllipsis />
                              )}
                              <PaginationItem>
                                <PaginationLink
                                  className="hover:bg-customColors-beigePaper"
                                  onClick={() => handlePageChange(totalPages)}
                                  isActive={currentPage === totalPages}
                                >
                                  {totalPages}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          )}
                          <PaginationItem>
                            <PaginationNext
                              className="hover:bg-customColors-beigePaper"
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
          </div>
        </div>
      </div>
    </div>
  );
}
