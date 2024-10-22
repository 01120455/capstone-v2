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
  measurementvalue?: number;
  unitprice?: number;
  totalamount: number;
  lastmodifiedat?: Date;
}

export default function Component() {
  const [purchases, setPurchases] = useState<TransactionTable[]>([]);
  const [filters, setFilters] = useState({
    purordno: "",
    name: "",
    supplier: "",
    frommilling: "all",
    status: "all",
    dateRange: { start: "", end: "" },
  });

  const [selectedTransaction, setSelectedTransaction] =
    useState<TransactionTable | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [showFilter, setShowFilter] = useState(false);
  const [purchaseOrderSuggestions, setPurchaseOrderSuggestions] = useState<
    string[]
  >([]);
  const [itemNameSuggestions, setItemNameSuggestions] = useState<string[]>([]);
  const [isPurchaseOrderDropdownVisible, setPurchaseOrderDropdownVisible] =
    useState(false);
  const [isItemDropdownVisible, setItemDropdownVisible] = useState(false);
  const dropdownRefPurchaseOrder = useRef<HTMLDivElement>(null);
  const dropdownRefItem = useRef<HTMLDivElement>(null);

  const [currentItemPage, setCurrentItemPage] = useState(1);
  const [transactionItemsPerPage, setTransactionItemsPerPage] = useState(5);

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  useEffect(() => {
    const getPurchases = async () => {
      try {
        const response = await fetch("/api/suppliertransaction");
        const text = await response.text();
        // console.log("Raw Response Text:", text);

        const data = JSON.parse(text);

        // Convert date strings to Date objects
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
      const purordNo =
        purchase.DocumentNumber?.documentnumber?.toLowerCase() || "";

      const statusMatches =
        filters.status === "all" || purchase.status === filters.status;
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
        purordNoMatches:
          !filters.purordno ||
          purordNo.includes(filters.purordno.toLowerCase()),
        statusMatches,

        frommillingMatches,
        itemNameMatches,
        dateRangeMatches,
      });

      return (
        (!filters.purordno ||
          purordNo.includes(filters.purordno.toLowerCase())) &&
        statusMatches &&
        frommillingMatches &&
        itemNameMatches &&
        dateRangeMatches
      );
    });
  }, [filters, purchases]);

  const handleClearFilters = () => {
    setFilters({
      purordno: "",
      name: "",
      supplier: "",
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

  const handlePurchaseOrderChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, purordno: value }));
    setPurchaseOrderDropdownVisible(e.target.value.length > 0);

    const filtered = purchases
      .map((p) => p.DocumentNumber?.documentnumber) // Use optional chaining to avoid undefined
      .filter(
        (purordno): purordno is string =>
          purordno !== undefined &&
          purordno.toLowerCase().includes(value.toLowerCase())
      );
    setPurchaseOrderSuggestions(filtered);
  };

  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, name: value }));
    setItemDropdownVisible(e.target.value.length > 0);

    const filtered = purchases
      .flatMap((p) => p.TransactionItem.map((item) => item?.Item?.name)) // Adjust according to your data structure
      .filter((itemName) =>
        itemName?.toLowerCase().includes(value.toLowerCase())
      );

    setItemNameSuggestions(Array.from(new Set(filtered)));
  };

  // Hide dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRefPurchaseOrder.current &&
        !dropdownRefPurchaseOrder.current.contains(event.target as Node)
      ) {
        setPurchaseOrderDropdownVisible(false);
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

  const fetchTransactionData = async (): Promise<CombinedTransactionItem[]> => {
    const transactionsResponse = await fetch("/api/suppliertransaction");
    const transactions: any[] = await transactionsResponse.json();
    console.log("Transactions:", transactions);

    const transactionItemsResponse = await fetch("/api/transactionitem");
    const transactionItems: TransactionItem[] =
      await transactionItemsResponse.json();
    console.log("Transaction Items:", transactionItems);

    const transactionMap = new Map<number, any>();
    transactions.forEach((transaction) => {
      transactionMap.set(transaction.transactionid, {
        documentNumber: transaction.DocumentNumber?.documentnumber,
        frommilling: transaction.frommilling,
        type: transaction.type,
        status: transaction.status,
      });
    });
    console.log("Transaction Map:", Array.from(transactionMap.entries()));

    const combinedData: CombinedTransactionItem[] = transactionItems.map(
      (item) => {
        const transactionInfo = transactionMap.get(item.transactionid) || {};

        const combinedItem = {
          ...item,
          documentNumber: transactionInfo.documentNumber,
          frommilling: transactionInfo.frommilling || false,
          type: transactionInfo.type || "otherType",
          status: transactionInfo.status || "otherStatus",
        };

        console.log("Combined Item:", combinedItem); // Log each combined item
        return combinedItem;
      }
    );

    // Filter out items with undefined documentNumber
    const filteredData = combinedData.filter(
      (item) => item.documentNumber !== undefined
    );
    console.log(
      "Filtered Data (without undefined documentNumber):",
      filteredData
    ); // Log the filtered data

    return filteredData;
  };

  const [transactionItem, setTransactionItem] = useState<
    CombinedTransactionItem[]
  >([]);

  useEffect(() => {
    const getData = async () => {
      const combinedData = await fetchTransactionData();
      setTransactionItem(combinedData);
    };

    getData();
  }, []);

  const refreshTransactionItems = async () => {
    const combinedData = await fetchTransactionData();
    setTransactionItem(combinedData);
  };

  console.log("Transaction Item:", transactionItem);

  const filteredTransactionItems = useMemo(() => {
    return transactionItem.filter((item) => {
      const purordno = item.documentNumber?.toLowerCase() || "";
      const statusMatches =
        filters.status === "all" || item.status === filters.status;
      const itemNameMatches = item.Item?.name
        ? item.Item.name.toLowerCase().includes(filters.name.toLowerCase())
        : false;

      const createdAt = item.lastmodifiedat
        ? new Date(item.lastmodifiedat)
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

      return (
        (!filters.purordno ||
          purordno.includes(filters.purordno.toLowerCase())) &&
        statusMatches &&
        itemNameMatches &&
        dateRangeMatches
      );
    });
  }, [filters, transactionItem]);

  const totalPagesTransactionItems = Math.ceil(
    filteredTransactionItems.length / transactionItemsPerPage
  );
  const paginatedTransactionItems = filteredTransactionItems.slice(
    (currentItemPage - 1) * transactionItemsPerPage,
    currentItemPage * transactionItemsPerPage
  );

  const handleItemPageChange = (page: number) => {
    setCurrentItemPage(page);
  };

  return (
    <div className="flex h-screen w-full bg-customColors-offWhite">
      <div className="flex-1 overflow-y-auto pt-8 pl-4 pr-4 w-full">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <h1 className="text-2xl font-bold mb-6">Purchase Order History</h1>
          <div className="grid gap-6 grid-cols-1">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                {/* <Input
                  type="text"
                  placeholder="Search Item name or Supplier Name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                /> */}
              </div>
              {selectedTransaction ? (
                <div className="bg-customColors-offWhite rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold">
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
                        {selectedTransaction.User
                          ? `${selectedTransaction.User.firstname} ${selectedTransaction.User.lastname}`
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
                                    <TableCell>{item.type}</TableCell>
                                    <TableCell>{item.sackweight}</TableCell>
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
                      <Popover>
                        <PopoverTrigger>
                          <FilterIcon className="w-6 h-6" />
                        </PopoverTrigger>
                        <PopoverContent className="bg-customColors-offWhite rounded-lg shadow-lg p-6">
                          <h2 className="text-lg font-bold mb-4">Filters</h2>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Button onClick={handleClearFilters}>
                                Clear Filters
                              </Button>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="document-number">
                                Purchase Order No.
                              </Label>
                              <Input
                                id="document-number"
                                type="text"
                                placeholder="Enter Purchase Order No."
                                value={filters.purordno}
                                onChange={handlePurchaseOrderChange}
                              />
                              {isPurchaseOrderDropdownVisible &&
                                purchaseOrderSuggestions.length > 0 && (
                                  <div
                                    ref={dropdownRefPurchaseOrder} // Attach ref to the dropdown
                                    className="absolute z-10 bg-white border border-gray-300 mt-14 w-44 max-h-60 overflow-y-auto"
                                  >
                                    {purchaseOrderSuggestions.map(
                                      (purordno) => (
                                        <div
                                          key={purordno}
                                          className="p-2 cursor-pointer hover:bg-gray-200"
                                          onClick={() =>
                                            setFilters((prev) => ({
                                              ...prev,
                                              purordno: purordno,
                                            }))
                                          }
                                        >
                                          {purordno}
                                        </div>
                                      )
                                    )}
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
                              {isItemDropdownVisible &&
                                itemNameSuggestions.length > 0 && (
                                  <div
                                    ref={dropdownRefItem} // Attach ref to the dropdown
                                    className="absolute z-10 bg-white border border-gray-300 mt-14 w-44 max-h-60 overflow-y-auto"
                                  >
                                    {itemNameSuggestions.map((item) => (
                                      <div
                                        key={item}
                                        className="p-2 cursor-pointer hover:bg-gray-200"
                                        onClick={() =>
                                          setFilters((prev) => ({
                                            ...prev,
                                            name: item,
                                          }))
                                        }
                                      >
                                        {item}
                                      </div>
                                    ))}
                                  </div>
                                )}
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
                                    <SelectItem value="pending">
                                      Pending
                                    </SelectItem>
                                    <SelectItem value="cancelled">
                                      Cancelled
                                    </SelectItem>
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
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                  <div className="table-container relative ">
                    <ScrollArea>
                      <Table
                        style={{ width: "100%" }}
                        className="min-w-[600px]  rounded-md border-border w-full h-10 overflow-clip relative"
                        divClassname="min-h-[300px] overflow-y-scroll max-h-[400px] lg:max-h-[600px] xl:max-h-[800px] overflow-y-auto"
                      >
                        <TableHeader className="sticky w-full top-0 h-10 border-b-2 border-border rounded-t-md">
                          <TableRow className="bg-customColors-mercury/50 hover:bg-customColors-mercury/50">
                            <TableHead>Purchase Order No.</TableHead>
                            {/* <TableHead>Walk-in</TableHead> */}
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
                                    {transaction.DocumentNumber.documentnumber}
                                  </TableCell>
                                  {/* <TableCell>
                                      {transaction.walkin ? "Yes" : "No"}
                                    </TableCell> */}
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
          </div>
          <div className="flex-1 overflow-y-hidden w-full">
            <div className="container">
              <div className="flex flex-col gap-6">
                <div className="flex  items-center justify-between mb-6 -mr-6">
                  <h1 className="text-2xl font-bold ">
                    List of Purchase Items from Milling
                  </h1>
                </div>
                <div className="flex items-center justify-between"></div>
                <div className="overflow-x-auto">
                  <div className="table-container relative">
                    <ScrollArea>
                      <Table
                        style={{ width: "100%" }}
                        className="min-w-[600px] rounded-md border-border w-full h-10 overflow-clip relative"
                        divClassname="min-h-[200px] overflow-y-scroll max-h-[400px] overflow-y-auto"
                      >
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
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedTransactionItems.map((purchaseItem) => (
                            <TableRow key={purchaseItem.transactionitemid}>
                              <TableCell>
                                {purchaseItem.documentNumber}
                              </TableCell>
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
                              <TableCell>
                                {purchaseItem.unitofmeasurement}
                              </TableCell>
                              <TableCell>
                                {purchaseItem.measurementvalue}
                              </TableCell>
                              <TableCell>{purchaseItem.unitprice}</TableCell>
                              <TableCell>{purchaseItem.totalamount}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="flex items-center justify-center mt-4 mb-4">
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() =>
                                  handleItemPageChange(
                                    Math.max(1, currentItemPage - 1)
                                  )
                                }
                              />
                            </PaginationItem>
                            {[...Array(totalPagesTransactionItems)].map(
                              (_, index) => (
                                <PaginationItem key={index}>
                                  <PaginationLink
                                    onClick={() =>
                                      handleItemPageChange(index + 1)
                                    }
                                    isActive={currentItemPage === index + 1}
                                  >
                                    {index + 1}
                                  </PaginationLink>
                                </PaginationItem>
                              )
                            )}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() =>
                                  handleItemPageChange(
                                    Math.min(
                                      totalPagesTransactionItems,
                                      currentItemPage + 1
                                    )
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
