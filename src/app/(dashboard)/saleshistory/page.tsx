"use client";

import { useState, useMemo, useEffect, useRef } from "react";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TransactionTable } from "@/schemas/transaction.schema";
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
import { Select } from "@radix-ui/react-select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Component() {
  const [purchases, setPurchases] = useState<TransactionTable[]>([]);
  const [filters, setFilters] = useState({
    invoiceno: "",
    name: "",
    customer: "",
    walkin: "all",
    frommilling: "all",
    status: "all",
    dateRange: { start: "", end: "" },
  });

  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionTable | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showFilter, setShowFilter] = useState(false);
  const [invoiceSuggestions, setInvoiceSuggestions] = useState<string[]>([]);
  const [itemNameSuggestions, setItemNameSuggestions] = useState<string[]>([]);
  const [isInvoiceDropdownVisible, setInvoiceDropdownVisible] = useState(false);
  const [isItemDropdownVisible, setItemDropdownVisible] = useState(false);
  const dropdownRefInvoice = useRef<HTMLDivElement>(null);
  const dropdownRefItem = useRef<HTMLDivElement>(null);

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  useEffect(() => {
    const getPurchases = async () => {
      try {
        const response = await fetch("/api/customertransaction");
        const text = await response.text();
        // console.log("Raw Response Text:", text);

        const data = JSON.parse(text);

        const parsedData = data.map((item: any) => {
          return {
            ...item,
            createdat: item.createdat ? new Date(item.createdat) : null,
            lastmodifiedat: item.lastmodifiedat
              ? new Date(item.lastmodifiedat)
              : null,
            taxamount: item.taxamount ? parseFloat(item.taxamount) : null,
          };
        });

        // console.log("Parsed Data with Date Conversion:", parsedData);

        // console.log("Parsed Data:", parsedData);
        setPurchases(parsedData);
      } catch (error) {
        console.error("Error in getPurchases:", error);
      }
    };

    getPurchases();
  }, []);

  const filteredTransactions = useMemo(() => {
    return purchases.filter((purchase) => {
      const invoiceNo =
        purchase.InvoiceNumber?.invoicenumber?.toLowerCase() || "";
      const statusMatches =
        filters.status === "all" || purchase.status === filters.status;
      const walkinMatches =
        filters.walkin === "all" ||
        (filters.walkin === "true" && purchase.walkin) ||
        (filters.walkin === "false" && !purchase.walkin);
      const frommillingMatches =
        filters.frommilling === "all" ||
        (filters.frommilling === "true" && purchase.frommilling) ||
        (filters.frommilling === "false" && !purchase.frommilling);
      const itemNameMatches = purchase.TransactionItem.some((item) => {
        const itemName = item?.Item?.name?.toLowerCase() || "";
        return itemName.includes(filters.name.toLowerCase());
      });

      const createdAt = purchase.createdat
        ? new Date(purchase.createdat)
        : null;
      const start = filters.dateRange.start
        ? new Date(filters.dateRange.start)
        : null;
      const end = filters.dateRange.end
        ? new Date(filters.dateRange.end)
        : null;

      const isWithinDateRange = (
        createdAt: Date | null,
        start: Date | null,
        end: Date | null
      ) => {
        if (!createdAt) return false;
        if (start && end) return createdAt >= start && createdAt <= end;
        if (start) return createdAt >= start;
        if (end) return createdAt <= end;
        return true;
      };

      const dateRangeMatches = isWithinDateRange(createdAt, start, end);

      console.log("Filtering Purchase:", purchase);
      console.log("Matches:", {
        invoiceNoMatches:
          !filters.invoiceno ||
          invoiceNo.includes(filters.invoiceno.toLowerCase()),
        statusMatches,
        walkinMatches,
        frommillingMatches,
        itemNameMatches,
        dateRangeMatches,
      });

      return (
        (!filters.invoiceno ||
          invoiceNo.includes(filters.invoiceno.toLowerCase())) &&
        statusMatches &&
        walkinMatches &&
        frommillingMatches &&
        itemNameMatches &&
        dateRangeMatches
      );
    });
  }, [filters, purchases]);

  const handleClearFilters = () => {
    setFilters({
      invoiceno: "",
      name: "",
      customer: "",
      walkin: "all",
      frommilling: "all",
      status: "all",
      dateRange: { start: "", end: "" },
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, invoiceno: value }));
    setInvoiceDropdownVisible(e.target.value.length > 0);

    const filtered = purchases
      .map((p) => p.InvoiceNumber?.invoicenumber)
      .filter(
        (invoice): invoice is string =>
          invoice !== undefined &&
          invoice.toLowerCase().includes(value.toLowerCase())
      );

    setInvoiceSuggestions(filtered);
  };

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, name: value }));
    setItemDropdownVisible(value.length > 0);

    const filtered = purchases
      .flatMap((p) => p.TransactionItem.map((item) => item?.Item?.name))
      .filter((itemName) =>
        itemName?.toLowerCase().includes(value.toLowerCase())
      );

    setItemNameSuggestions(Array.from(new Set(filtered)));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRefInvoice.current &&
        !dropdownRefInvoice.current.contains(event.target as Node)
      ) {
        setInvoiceDropdownVisible(false);
      }
      if (
        dropdownRefItem.current &&
        !dropdownRefItem.current.contains(event.target as Node)
      ) {
        setItemDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside as EventListener);
    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener
      );
    };
  }, []);

  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const handleWalkinChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      walkin: value,
    }));
  };

  const handleFromMillingChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      frommilling: value,
    }));
  };

  return (
    <div className="flex h-screen w-full bg-customColors-offWhite">
      <div className="flex-1 overflow-y-auto pt-8 pl-4 pr-4 w-full">
        <div className="mx-auto px-4 md:px-6 ">
          <h1 className="text-2xl font-bold mb-6">Sales History</h1>
          <div
            className={`grid gap-6 ${
              showFilter ? "grid-cols-[1fr_220px]" : "auto-cols-fr"
            }`}
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4"></div>
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
                          <Table
                            style={{ width: "100%" }}
                            className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative"
                            divClassname="min-h-[200px] overflow-y-scroll max-h-[200px] overflow-y-auto"
                          >
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
                                    <TableCell>
                                      {item.Item.sackweight}
                                    </TableCell>
                                    <TableCell>
                                      {item.unitofmeasurement}
                                    </TableCell>
                                    <TableCell>
                                      {item.measurementvalue}
                                    </TableCell>
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
                      <div>
                        {formatPrice(selectedTransaction.totalamount ?? 0)}
                      </div>
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
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleFilter}
                      >
                        <span className="sr-only">Filter</span>
                        <FilterIcon className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="table-container relative  ">
                    <ScrollArea>
                      <Table
                        style={{ width: "100%" }}
                        className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative"
                        divClassname="min-h-[300px] overflow-y-scroll max-h-[400px] lg:max-h-[600px] xl:max-h-[800px] overflow-y-auto"
                      >
                        <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                          <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
                            <TableHead>Invoice No.</TableHead>
                            <TableHead>Walk-in</TableHead>
                            <TableHead>From Milling</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedTransactions.length > 0 ? (
                            paginatedTransactions.map(
                              (
                                transaction: TransactionTable,
                                index: number
                              ) => (
                                <TableRow
                                  key={index}
                                  onClick={() =>
                                    setSelectedTransaction(transaction)
                                  }
                                  className="cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                                >
                                  <TableCell>
                                    {transaction.InvoiceNumber.invoicenumber}
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
                            {/* {[...Array(totalPages)].map((_, index) => (
                              <PaginationItem key={index}>
                                <PaginationLink
                                  onClick={() => handlePageChange(index + 1)}
                                  isActive={currentPage === index + 1}
                                >
                                  {index + 1}
                                </PaginationLink>
                              </PaginationItem>
                            ))} */}

                            {currentPage > 3 && (
                              <>
                                <PaginationItem>
                                  <PaginationLink
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
                                      onClick={() =>
                                        handlePageChange(pageIndex)
                                      }
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
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                </div>
              )}
            </div>
            <div
              className={`bg-customColors-offWhite rounded-lg shadow-lg p-6 ${
                showFilter ? "block" : "hidden"
              }`}
            >
              <h2 className="text-lg font-bold mb-4">Filters</h2>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Button className="mt-9" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invoice-number">Invoice Number</Label>
                  <Input
                    id="invoice-number"
                    type="text"
                    placeholder="Enter Invoice Number"
                    value={filters.invoiceno}
                    onChange={handleInvoiceChange}
                  />
                  {isInvoiceDropdownVisible &&
                    invoiceSuggestions.length > 0 && (
                      <div
                        ref={dropdownRefInvoice}
                        className="absolute z-10 bg-white border border-gray-300 mt-14 w-44 max-h-60 overflow-y-auto"
                      >
                        {invoiceSuggestions.map((invoice) => (
                          <div
                            key={invoice}
                            className="p-2 cursor-pointer hover:bg-gray-200"
                            onClick={() =>
                              setFilters((prev) => ({
                                ...prev,
                                invoiceno: invoice,
                              }))
                            }
                          >
                            {invoice}
                          </div>
                        ))}
                      </div>
                    )}
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
                  {isItemDropdownVisible && itemNameSuggestions.length > 0 && (
                    <div
                      ref={dropdownRefItem}
                      className="absolute z-10 bg-white border border-gray-300 mt-14 w-44 max-h-60 overflow-y-auto"
                    >
                      {itemNameSuggestions.map((item) => (
                        <div
                          key={item}
                          className="p-2 cursor-pointer hover:bg-gray-200"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, name: item }))
                          }
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="walkin">Walkin</Label>
                  <Select
                    value={filters.walkin}
                    onValueChange={handleWalkinChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </SelectTrigger>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="frommillin">From Milling</Label>
                  <Select
                    value={filters.frommilling}
                    onValueChange={handleFromMillingChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </SelectTrigger>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>{" "}
                        {/* Fixed value here */}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
